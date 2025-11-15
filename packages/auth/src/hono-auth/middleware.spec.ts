import { describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const initAuthConfig = { _tag: "init" };
  const authHandler = { _tag: "auth" };
  const verifyAuth = { _tag: "verify" };
  return { authHandler, initAuthConfig, verifyAuth };
});

vi.mock("@hono/auth-js", () => ({
  authHandler: h.authHandler,
  initAuthConfig: h.initAuthConfig,
  verifyAuth: h.verifyAuth,
}));

import * as exported from "./middleware";

describe("hono-auth/middleware re-exports", () => {
  it("re-exports initAuthConfig, authHandler, verifyAuth from @hono/auth-js", () => {
    expect(exported.initAuthConfig).toBe(h.initAuthConfig);
    expect(exported.authHandler).toBe(h.authHandler);
    expect(exported.verifyAuth).toBe(h.verifyAuth);
  });
});
