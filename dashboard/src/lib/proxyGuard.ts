/**
 * SSRF guard for the dev-server Confluence proxy.
 *
 * Lives in src/ (not vite.config.ts) so it can be unit-tested in isolation
 * without booting the Vite config. vite.config.ts imports `isBlockedTarget`
 * from here and applies it to every proxied request.
 */

/** HTTP methods the proxy is permitted to forward. */
export const ALLOWED_PROXY_METHODS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH"]);

/**
 * Returns true if the URL must be blocked:
 *  - Non-HTTPS scheme (file://, http://, etc.)
 *  - Loopback: localhost, 127.x.x.x, ::1
 *  - Link-local / cloud metadata: 169.254.x.x (incl. AWS/GCP IMDS 169.254.169.254)
 *  - RFC-1918 private ranges: 10.x, 172.16-31.x, 192.168.x
 *  - IPv6 ULA: fd00::/8
 *  - Wildcard / unspecified: 0.0.0.0
 */
export function isBlockedTarget(rawUrl: string): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return true; // unparseable → block
  }

  if (url.protocol !== "https:") return true;

  // IPv6 hosts are serialised with brackets (e.g. "[::1]") - strip them so the
  // loopback / ULA checks below match the bare address.
  let h = url.hostname.toLowerCase();
  if (h.startsWith("[") && h.endsWith("]")) h = h.slice(1, -1);

  if (h === "localhost" || h === "0.0.0.0" || h === "::1") return true;
  if (/^127\./.test(h)) return true;                      // loopback
  if (/^169\.254\./.test(h)) return true;                 // link-local / IMDS
  if (/^10\./.test(h)) return true;                       // RFC-1918 class A
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;  // RFC-1918 class B
  if (/^192\.168\./.test(h)) return true;                 // RFC-1918 class C
  if (/^fd[0-9a-f]{2}:/i.test(h)) return true;            // IPv6 ULA

  return false;
}
