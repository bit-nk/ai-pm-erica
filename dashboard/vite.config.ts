import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

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
 * Proxies POST /api/claude/v1/messages -> https://api.anthropic.com/v1/messages.
 * The API key is read from the x-claude-api-key request header (set by the
 * browser from localStorage) and forwarded as x-api-key. The target is always
 * the Anthropic API — no SSRF surface.
 */
function claudeProxyPlugin() {
  return {
    name: "claude-proxy",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configureServer(server: any) {
      server.middlewares.use(
        "/api/claude",
        async (req: any, res: any) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Method not allowed" }));
            return;
          }

          const apiKey = req.headers["x-claude-api-key"] as string | undefined;
          if (!apiKey || !apiKey.startsWith("sk-ant-")) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Missing or invalid Anthropic API key (must start with sk-ant-)" }));
            return;
          }

          // Strip /api/claude prefix to get the Anthropic path (e.g. /v1/messages)
          const subpath = (req.url as string) || "/v1/messages";

          const chunks: Uint8Array[] = [];
          await new Promise<void>((resolve) => {
            req.on("data", (chunk: Uint8Array) => chunks.push(chunk));
            req.on("end", resolve);
          });
          const body = chunks.length > 0 ? Buffer.concat(chunks).toString("utf8") : undefined;

          try {
            const upstream = await fetch(`https://api.anthropic.com${subpath}`, {
              method: "POST",
              headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              ...(body ? { body } : {}),
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

function confluenceProxyPlugin() {
  return {
    name: "confluence-proxy",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configureServer(server: any) {
      server.middlewares.use(
        "/api/confluence-proxy",
        async (req: any, res: any) => {
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
          const chunks: Uint8Array[] = [];
          await new Promise<void>((resolve) => {
            req.on("data", (chunk: Uint8Array) => chunks.push(chunk));
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
  plugins: [react(), claudeProxyPlugin(), confluenceProxyPlugin()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 5173, open: true },
});
