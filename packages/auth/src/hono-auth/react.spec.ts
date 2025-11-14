import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const getSessionMock = vi.fn();
  const signInMock = vi.fn();
  const signOutMock = vi.fn();
  const useSessionMock = vi.fn();
  function DummyProvider(): null {
    return null;
  }
  return {
    DummyProvider,
    getSessionMock,
    signInMock,
    signOutMock,
    useSessionMock,
  };
});

vi.mock("@hono/auth-js/react", () => ({
  SessionProvider: h.DummyProvider,
  getSession: h.getSessionMock,
  signIn: h.signInMock,
  signOut: h.signOutMock,
  useSession: h.useSessionMock,
}));

import { AuthProvider, getUserId, signIn, signOut, useUser } from "./react";

describe("hono-auth/react shims", () => {
  beforeEach(() => vi.clearAllMocks());

  it("re-exports SessionProvider as AuthProvider", () => {
    expect(AuthProvider).toBe(h.DummyProvider);
  });

  it("getUserId returns id when present and undefined otherwise", async () => {
    h.getSessionMock.mockResolvedValueOnce({ user: { id: "u-1" } });
    await expect(getUserId()).resolves.toBe("u-1");

    h.getSessionMock.mockResolvedValueOnce(undefined);
    await expect(getUserId()).resolves.toBeUndefined();
  });

  it("signIn maps redirectTo to callbackUrl", async () => {
    h.signInMock.mockResolvedValueOnce("ok");
    const out = await signIn("google", { redirectTo: "/home" });
    expect(h.signInMock).toHaveBeenCalledWith("google", {
      callbackUrl: "/home",
    });
    expect(out).toBe("ok");
  });

  it("signOut maps redirectTo to callbackUrl", async () => {
    h.signOutMock.mockResolvedValueOnce("bye");
    const out = await signOut({ redirectTo: "/bye" });
    expect(h.signOutMock).toHaveBeenCalledWith({ callbackUrl: "/bye" });
    expect(out).toBe("bye");
  });

  it("useUser returns session.user when available", () => {
    const user = { id: "u-1" };
    h.useSessionMock.mockReturnValueOnce({ data: { user } });
    expect(useUser()).toBe(user);
  });
});
