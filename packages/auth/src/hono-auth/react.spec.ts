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

describe("hono-auth react helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("re-exports SessionProvider as AuthProvider", () => {
    expect(AuthProvider).toBe(h.DummyProvider);
  });

  it("getUserId returns undefined when no session", async () => {
    h.getSessionMock.mockResolvedValueOnce(undefined);
    await expect(getUserId()).resolves.toBeUndefined();
  });

  it("getUserId returns undefined when user has no id", async () => {
    h.getSessionMock.mockResolvedValueOnce({ user: { name: "Ada" } });
    await expect(getUserId()).resolves.toBeUndefined();
  });

  it("getUserId returns id when present", async () => {
    h.getSessionMock.mockResolvedValueOnce({ user: { id: "user-1" } });
    await expect(getUserId()).resolves.toBe("user-1");
  });

  it("signIn forwards provider and maps redirectTo -> callbackUrl", async () => {
    h.signInMock.mockResolvedValueOnce("ok");
    const res = await signIn("google", { redirectTo: "/home" });
    expect(h.signInMock).toHaveBeenCalledWith("google", {
      callbackUrl: "/home",
    });
    expect(res).toBe("ok");
  });

  it("signIn without args passes empty options", async () => {
    h.signInMock.mockResolvedValueOnce("ok2");
    const res = await signIn();
    expect(h.signInMock).toHaveBeenCalledWith(undefined, {});
    expect(res).toBe("ok2");
  });

  it("signOut maps redirectTo -> callbackUrl when provided", async () => {
    h.signOutMock.mockResolvedValueOnce("bye");
    const res = await signOut({ redirectTo: "/bye" });
    expect(h.signOutMock).toHaveBeenCalledWith({ callbackUrl: "/bye" });
    expect(res).toBe("bye");
  });

  it("signOut without options passes empty object", async () => {
    h.signOutMock.mockResolvedValueOnce("bye2");
    const res = await signOut();
    expect(h.signOutMock).toHaveBeenCalledWith({});
    expect(res).toBe("bye2");
  });

  it("useUser returns undefined when session missing", () => {
    h.useSessionMock.mockReturnValueOnce({ data: undefined });
    expect(useUser()).toBeUndefined();
  });

  it("useUser returns undefined when user missing", () => {
    h.useSessionMock.mockReturnValueOnce({ data: {} });
    expect(useUser()).toBeUndefined();
  });

  it("useUser returns session.user when available", () => {
    const user = { id: "u-1", name: "Ada" };
    h.useSessionMock.mockReturnValueOnce({ data: { user } });
    expect(useUser()).toBe(user);
  });
});
