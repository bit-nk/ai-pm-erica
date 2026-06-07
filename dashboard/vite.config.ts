import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import type { IncomingMessage, ServerResponse } from "node:http";

/* ── Security: proxy request validation ────────────────────────────── */

const ALLOWED_PROXY_METHODS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH"]);

/**
 * Returns true if the URL must be blocked:
 *  - Non-HTTPS scheme (file://, http://, etc.)
 *  - Loopback: localhost, 127.x.x.x, ::1
 *  - Link-local / cloud metadata: 169.254.x.x
 *  - RFC-1918 private ranges: 10.x, 172.16-31.x, 192.168.x
 *  - IPv6 ULA: fd00::/8
 *  - Wildcard / unspecified: 0.0.0.0
 */
function isBlockedTarget(rawUrl: string): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return true; // unparseable → block
  }

  if (url.protocol !== "https:") return true;

  const h = url.hostname.toLowerCase();

  if (h === "localhost" || h === "0.0.0.0" || h === "::1") return true;
  if (/^127\./.test(h)) return true;               // loopback
  if (/^169\.254\./.test(h)) return true;           // link-local / IMDS
  if (/^10\./.test(h)) return true;                 // RFC-1918 class A
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true; // RFC-1918 class B
  if (/^192\.168\./.test(h)) return true;           // RFC-1918 class C
  if (/^fd[0-9a-f]{2}:/i.test(h)) return true;     // IPv6 ULA

  return false;
}

/**
 * Vite dev-server middleware that proxies Confluence API calls server-side,
 * bypassing the CORS restriction that blocks direct browser → Atlassian requests.
 *
 * Security controls applied before any upstream fetch:
 *   1. Target URL must be HTTPS and must not resolve to a private/internal address.
 *   2. HTTP method must be in the explicit allowlist (GET/POST/PUT/DELETE/PATCH).
 *   3. Auth header is only forwarded to the validated upstream host.
 */
function confluenceProxyPlugin() {
  return {
    name: "confluence-proxy",
    configureServer(server: { middlewares: { use: (path: string, fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void } }) {
      server.middlewares.use(
        "/api/confluence-proxy",
        async (req: IncomingMessage, res: ServerResponse) => {
          const targetUrl = req.headers["x-confluence-target-url"] as string | undefined;
          const rawMethod = (req.headers["x-confluence-method"] as string | undefined) ?? "GET";
          const auth = req.headers["x-confluence-auth"] as string | undefined;

          // ── Require both headers ──
          if (!targetUrl || !auth) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing X-Confluence-Target-URL or X-Confluence-Auth header" }));
            return;
          }

          // ── Block private/internal targets (SSRF protection) ──
          if (isBlockedTarget(targetUrl)) {
            res.statusCode = 403;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Target URL not permitted — must be an HTTPS external host" }));
            return;
          }

          // ── Method allowlist ──
          const method = rawMethod.toUpperCase();
          if (!ALLOWED_PROXY_METHODS.has(method)) {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: `Method not allowed: ${method}` }));
            return;
          }

          // Read request body (present for POST/PUT)
          const chunks: Buffer[] = [];
          await new Promise<void>((resolve) => {
            req.on("data", (chunk: Buffer) => chunks.push(chunk));
            req.on("end", resolve);
          });
          const rawBody = chunks.length > 0 ? Buffer.concat(chunks).toString("utf8") : undefined;

          try {
            const upstream = await fetch(targetUrl, {
              method,
              headers: {
                Authorization: auth,
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              ...(rawBody ? { body: rawBody } : {}),
            });

            res.statusCode = upstream.status;
            res.setHeader("Content-Type", upstream.headers.get("content-type") ?? "application/json");
            res.end(await upstream.text());
          } catch (err) {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Upstream fetch failed", message: String(err) }));
          }
        },
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), confluenceProxyPlugin()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 5173, open: true },
});
