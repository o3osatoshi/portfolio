import { describe, expect, it, vi } from "vitest";

// Hoist the mocks used inside vi.mock factory
const h = vi.hoisted(() => {
  const authMock = vi.fn();
  const NextAuthMock = vi.fn((_config: unknown) => ({ auth: authMock }));
  return { authMock, NextAuthMock };
});

vi.mock("next-auth", () => ({ default: h.NextAuthMock }));

import { authConfig } from "./config";
import { middleware } from "./middleware";

describe("@repo/auth/middleware", () => {
  it("exports the auth function from NextAuth(authConfig)", () => {
    expect(h.NextAuthMock).toHaveBeenCalledTimes(1);
    const passed = h.NextAuthMock.mock.calls[0]?.[0];
    // The middleware should pass the same authConfig reference
    expect(passed).toBe(authConfig);
    // And re-export the returned auth as middleware
    expect(middleware).toBe(h.authMock);
  });
});
