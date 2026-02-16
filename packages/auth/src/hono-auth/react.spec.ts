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

    h.getSessionMock.mockResolvedValueOnce({});
    await expect(getUserId()).resolves.toBeUndefined();

    h.getSessionMock.mockResolvedValueOnce(undefined);
    await expect(getUserId()).resolves.toBeUndefined();
  });

  it("signIn maps redirectTo to callbackUrl when provided", async () => {
    h.signInMock.mockResolvedValueOnce("ok");
    const out = await signIn("oidc", { redirectTo: "/home" });
    expect(h.signInMock).toHaveBeenCalledWith("oidc", {
      callbackUrl: "/home",
    });
    expect(out).toBe("ok");
  });

  it("signIn forwards provider with empty options when redirectTo is not provided", async () => {
    h.signInMock.mockResolvedValueOnce("ok");
    const out = await signIn("oidc");
    expect(h.signInMock).toHaveBeenCalledWith("oidc", {});
    expect(out).toBe("ok");
  });

  it("signOut maps redirectTo to callbackUrl when provided", async () => {
    h.signOutMock.mockResolvedValueOnce("bye");
    const out = await signOut({ redirectTo: "/bye" });
    expect(h.signOutMock).toHaveBeenCalledWith({ callbackUrl: "/bye" });
    expect(out).toBe("bye");
  });

  it("signOut calls underlying signOut with empty options when redirectTo is not provided", async () => {
    h.signOutMock.mockResolvedValueOnce("bye");
    const out = await signOut();
    expect(h.signOutMock).toHaveBeenCalledWith({});
    expect(out).toBe("bye");
  });

  it("useUser returns validated user when session contains a valid user", () => {
    const user = { id: "u-1", name: "Alice" };
    h.useSessionMock.mockReturnValueOnce({ data: { user } });
    expect(useUser()).toEqual(user);
  });

  it("useUser returns undefined when there is no session data", () => {
    h.useSessionMock.mockReturnValueOnce({});
    expect(useUser()).toBeUndefined();
  });

  it("useUser returns undefined when session has no user", () => {
    h.useSessionMock.mockReturnValueOnce({ data: {} });
    expect(useUser()).toBeUndefined();
  });

  it("useUser returns undefined when user fails schema validation", () => {
    const invalidUser = { id: 123 };
    h.useSessionMock.mockReturnValueOnce({ data: { user: invalidUser } });
    expect(useUser()).toBeUndefined();
  });
});
