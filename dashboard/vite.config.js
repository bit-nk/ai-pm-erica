var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
/* ── Security: proxy request validation ────────────────────────────── */
var ALLOWED_PROXY_METHODS = new Set(["GET", "POST", "PUT", "DELETE", "PATCH"]);
/**
 * Returns true if the URL must be blocked:
 *  - Non-HTTPS scheme (file://, http://, etc.)
 *  - Loopback: localhost, 127.x.x.x, ::1
 *  - Link-local / cloud metadata: 169.254.x.x
 *  - RFC-1918 private ranges: 10.x, 172.16-31.x, 192.168.x
 *  - IPv6 ULA: fd00::/8
 *  - Wildcard / unspecified: 0.0.0.0
 */
function isBlockedTarget(rawUrl) {
    var url;
    try {
        url = new URL(rawUrl);
    }
    catch (_a) {
        return true; // unparseable → block
    }
    if (url.protocol !== "https:")
        return true;
    var h = url.hostname.toLowerCase();
    if (h === "localhost" || h === "0.0.0.0" || h === "::1")
        return true;
    if (/^127\./.test(h))
        return true; // loopback
    if (/^169\.254\./.test(h))
        return true; // link-local / IMDS
    if (/^10\./.test(h))
        return true; // RFC-1918 class A
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(h))
        return true; // RFC-1918 class B
    if (/^192\.168\./.test(h))
        return true; // RFC-1918 class C
    if (/^fd[0-9a-f]{2}:/i.test(h))
        return true; // IPv6 ULA
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
        configureServer: function (server) {
            var _this = this;
            server.middlewares.use("/api/confluence-proxy", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var targetUrl, rawMethod, auth, method, chunks, rawBody, upstream, _a, _b, err_1;
                var _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            targetUrl = req.headers["x-confluence-target-url"];
                            rawMethod = (_c = req.headers["x-confluence-method"]) !== null && _c !== void 0 ? _c : "GET";
                            auth = req.headers["x-confluence-auth"];
                            // ── Require both headers ──
                            if (!targetUrl || !auth) {
                                res.statusCode = 400;
                                res.setHeader("Content-Type", "application/json");
                                res.end(JSON.stringify({ error: "Missing X-Confluence-Target-URL or X-Confluence-Auth header" }));
                                return [2 /*return*/];
                            }
                            // ── Block private/internal targets (SSRF protection) ──
                            if (isBlockedTarget(targetUrl)) {
                                res.statusCode = 403;
                                res.setHeader("Content-Type", "application/json");
                                res.end(JSON.stringify({ error: "Target URL not permitted — must be an HTTPS external host" }));
                                return [2 /*return*/];
                            }
                            method = rawMethod.toUpperCase();
                            if (!ALLOWED_PROXY_METHODS.has(method)) {
                                res.statusCode = 405;
                                res.setHeader("Content-Type", "application/json");
                                res.end(JSON.stringify({ error: "Method not allowed: ".concat(method) }));
                                return [2 /*return*/];
                            }
                            chunks = [];
                            return [4 /*yield*/, new Promise(function (resolve) {
                                    req.on("data", function (chunk) { return chunks.push(chunk); });
                                    req.on("end", resolve);
                                })];
                        case 1:
                            _e.sent();
                            rawBody = chunks.length > 0 ? Buffer.concat(chunks).toString("utf8") : undefined;
                            _e.label = 2;
                        case 2:
                            _e.trys.push([2, 5, , 6]);
                            return [4 /*yield*/, fetch(targetUrl, __assign({ method: method, headers: {
                                        Authorization: auth,
                                        "Content-Type": "application/json",
                                        Accept: "application/json",
                                    } }, (rawBody ? { body: rawBody } : {})))];
                        case 3:
                            upstream = _e.sent();
                            res.statusCode = upstream.status;
                            res.setHeader("Content-Type", (_d = upstream.headers.get("content-type")) !== null && _d !== void 0 ? _d : "application/json");
                            _b = (_a = res).end;
                            return [4 /*yield*/, upstream.text()];
                        case 4:
                            _b.apply(_a, [_e.sent()]);
                            return [3 /*break*/, 6];
                        case 5:
                            err_1 = _e.sent();
                            res.statusCode = 502;
                            res.setHeader("Content-Type", "application/json");
                            res.end(JSON.stringify({ error: "Upstream fetch failed", message: String(err_1) }));
                            return [3 /*break*/, 6];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
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
