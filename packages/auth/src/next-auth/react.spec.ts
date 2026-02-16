import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const signInMock = vi.fn();
  const signOutMock = vi.fn();
  const useSessionMock = vi.fn();
  function DummyProvider(): null {
    return null;
  }
  return { DummyProvider, signInMock, signOutMock, useSessionMock };
});

vi.mock("next-auth/react", () => ({
  SessionProvider: h.DummyProvider,
  signIn: h.signInMock,
  signOut: h.signOutMock,
  useSession: h.useSessionMock,
}));

import { AuthProvider, signIn, signOut, useUser } from "./react";

describe("@repo/auth/react helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("re-exports SessionProvider as AuthProvider", () => {
    expect(AuthProvider).toBe(h.DummyProvider);
  });

  it("signIn forwards provider and options", async () => {
    h.signInMock.mockResolvedValueOnce("ok");
    const res = await signIn("oidc", { redirectTo: "/" });
    expect(h.signInMock).toHaveBeenCalledWith("oidc", { redirectTo: "/" });
    expect(res).toBe("ok");
  });

  it("signOut forwards options", async () => {
    h.signOutMock.mockResolvedValueOnce("bye");
    const res = await signOut({ redirectTo: "/" });
    expect(h.signOutMock).toHaveBeenCalledWith({ redirectTo: "/" });
    expect(res).toBe("bye");
  });

  it("useUser returns undefined when session missing", () => {
    h.useSessionMock.mockReturnValueOnce({ data: undefined });
    expect(useUser()).toBeUndefined();
  });

  it("useUser returns session.user when available", () => {
    const user = { id: "u-1", name: "Ada" };
    h.useSessionMock.mockReturnValueOnce({ data: { user } });
    expect(useUser()).toBe(user);
  });
});
