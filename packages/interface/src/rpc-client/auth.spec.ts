import { describe, expect, it } from "vitest";

import { type AuthConfig, withAuth } from "./auth";

describe("rpc-client/auth", () => {
  it("returns init unchanged when auth is none or undefined", () => {
    const init = { method: "GET" } satisfies RequestInit;
    expect(withAuth(init)).toBe(init);
    expect(withAuth(init, { type: "none" })).toBe(init);
  });

  it("applies bearer token to Authorization header and preserves existing headers", () => {
    const init: RequestInit = { headers: new Headers({ "X-Base": "1" }) };
    const out = withAuth(init, {
      token: "abc",
      type: "bearer",
    } satisfies AuthConfig);
    const headers = new Headers(out.headers);
    expect(headers.get("X-Base")).toBe("1");
    expect(headers.get("Authorization")).toBe("Bearer abc");
    // original headers object should not be mutated
    const original = new Headers(init.headers);
    expect(original.get("Authorization")).toBeNull();
  });

  it("applies cookie header and overwrites any previous Cookie", () => {
    const init: RequestInit = { headers: { Cookie: "a=1" } };
    const out = withAuth(init, {
      cookie: "sess=xyz",
      type: "cookie",
    } satisfies AuthConfig);
    const headers = new Headers(out.headers);
    expect(headers.get("Cookie")).toBe("sess=xyz");
  });
});
