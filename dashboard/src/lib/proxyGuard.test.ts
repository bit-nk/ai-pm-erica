import { describe, it, expect } from "vitest";
import { isBlockedTarget, ALLOWED_PROXY_METHODS } from "./proxyGuard";

describe("isBlockedTarget - SSRF guard for the Confluence proxy", () => {
  it("blocks cloud metadata / IMDS endpoints", () => {
    // The classic SSRF target: AWS/GCP/Azure instance metadata service.
    expect(isBlockedTarget("https://169.254.169.254/latest/meta-data/")).toBe(true);
    expect(isBlockedTarget("https://169.254.0.1/")).toBe(true);
  });

  it("blocks loopback addresses", () => {
    expect(isBlockedTarget("https://localhost/wiki")).toBe(true);
    expect(isBlockedTarget("https://127.0.0.1/")).toBe(true);
    expect(isBlockedTarget("https://127.1.2.3/")).toBe(true);
    expect(isBlockedTarget("https://[::1]/")).toBe(true);
  });

  it("blocks RFC-1918 private ranges", () => {
    expect(isBlockedTarget("https://10.0.0.5/")).toBe(true);
    expect(isBlockedTarget("https://172.16.0.1/")).toBe(true);
    expect(isBlockedTarget("https://172.31.255.255/")).toBe(true);
    expect(isBlockedTarget("https://192.168.1.1/")).toBe(true);
  });

  it("allows public 172.x addresses outside the private block", () => {
    // 172.15 and 172.32 are public - the guard must not over-block.
    expect(isBlockedTarget("https://172.15.0.1/")).toBe(false);
    expect(isBlockedTarget("https://172.32.0.1/")).toBe(false);
  });

  it("blocks IPv6 unique-local addresses and the unspecified host", () => {
    expect(isBlockedTarget("https://[fd00::1]/")).toBe(true);
    expect(isBlockedTarget("https://0.0.0.0/")).toBe(true);
  });

  it("blocks non-HTTPS schemes", () => {
    expect(isBlockedTarget("http://example.atlassian.net/")).toBe(true);
    expect(isBlockedTarget("file:///etc/passwd")).toBe(true);
    expect(isBlockedTarget("ftp://example.com/")).toBe(true);
  });

  it("blocks unparseable URLs", () => {
    expect(isBlockedTarget("not a url")).toBe(true);
    expect(isBlockedTarget("")).toBe(true);
  });

  it("allows legitimate public HTTPS Confluence hosts", () => {
    expect(isBlockedTarget("https://example.atlassian.net/wiki/rest/api/content")).toBe(false);
    expect(isBlockedTarget("https://confluence.example.com/")).toBe(false);
  });

  it("permits exactly the expected HTTP methods", () => {
    expect([...ALLOWED_PROXY_METHODS].sort()).toEqual(
      ["DELETE", "GET", "PATCH", "POST", "PUT"],
    );
    expect(ALLOWED_PROXY_METHODS.has("CONNECT")).toBe(false);
    expect(ALLOWED_PROXY_METHODS.has("TRACE")).toBe(false);
  });
});
