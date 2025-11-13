import { describe, expect, it, vi } from "vitest";

// Hoist the mocks used inside vi.mock factory
const h = vi.hoisted(() => {
  const authHandler = vi.fn();
  const initAuthConfig = vi.fn();
  const verifyAuth = vi.fn();
  return { authHandler, initAuthConfig, verifyAuth };
});

vi.mock("@hono/auth-js", () => ({
  authHandler: h.authHandler,
  initAuthConfig: h.initAuthConfig,
  verifyAuth: h.verifyAuth,
}));

import { authHandler, initAuthConfig, verifyAuth } from "./middleware";

describe("hono-auth middleware re-exports", () => {
  it("forwards functions from @hono/auth-js", () => {
    expect(authHandler).toBe(h.authHandler);
    expect(initAuthConfig).toBe(h.initAuthConfig);
    expect(verifyAuth).toBe(h.verifyAuth);
  });
});
