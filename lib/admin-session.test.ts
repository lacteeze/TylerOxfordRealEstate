import { describe, expect, it } from "vitest";
import {
  isRememberPref,
  rememberPrefFromDocumentCookie,
  safeAdminNextPath,
  serializeBrowserCookie,
  withAuthCookieLifetime,
} from "./admin-session";

describe("remember-me cookie lifetime", () => {
  it("treats missing or 1 as remember, and 0 as a short session", () => {
    expect(isRememberPref(undefined)).toBe(true);
    expect(isRememberPref("1")).toBe(true);
    expect(isRememberPref("0")).toBe(false);
  });

  it("sets a 30-day maxAge when remembering, drops maxAge otherwise, and keeps deletions", () => {
    expect(withAuthCookieLifetime({ path: "/", maxAge: 99 }, true).maxAge).toBe(
      60 * 60 * 24 * 30
    );
    expect(withAuthCookieLifetime({ path: "/", maxAge: 99 }, false).maxAge).toBeUndefined();
    expect(withAuthCookieLifetime({ path: "/", maxAge: 0 }, true).maxAge).toBe(0);
  });

  it("reads the remember preference from a document cookie header", () => {
    expect(rememberPrefFromDocumentCookie("to-admin-remember=0; other=1")).toBe(false);
    expect(rememberPrefFromDocumentCookie("other=1")).toBe(true);
  });

  it("serializes a session cookie without Max-Age when not remembering", () => {
    const session = serializeBrowserCookie("sb-auth", "token", { path: "/", sameSite: "lax" });
    expect(session).not.toMatch(/Max-Age=/);
    const remembered = serializeBrowserCookie("sb-auth", "token", {
      path: "/",
      maxAge: 60,
      sameSite: "lax",
    });
    expect(remembered).toContain("Max-Age=60");
  });
});

describe("safeAdminNextPath", () => {
  it("allows admin pages and rejects open redirects", () => {
    expect(safeAdminNextPath("/admin/update-password")).toBe("/admin/update-password");
    expect(safeAdminNextPath("https://evil.example/listings")).toBe("/admin");
    expect(safeAdminNextPath("//evil.example")).toBe("/admin");
    expect(safeAdminNextPath("/listings")).toBe("/admin");
    expect(safeAdminNextPath("/admin/auth/callback")).toBe("/admin");
  });
});
