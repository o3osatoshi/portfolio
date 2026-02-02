import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    cookiesMock: vi.fn(),
    getUserIdMock: vi.fn(),
  };
});

vi.mock("next/headers", () => ({
  cookies: h.cookiesMock,
}));

vi.mock("@repo/auth", () => ({
  getUserId: h.getUserIdMock,
}));

vi.mock("@/env/server", () => ({
  env: {
    AUTH_SECRET: "test-secret",
  },
}));

import { getUserId } from "./auth";

describe("server/auth getUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns Ok with userId when token is valid", async () => {
    h.cookiesMock.mockResolvedValueOnce({
      toString: () => "__Secure-authjs.session-token=token",
    });
    h.getUserIdMock.mockResolvedValueOnce("u1");

    const res = await getUserId();

    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;

    expect(res.value).toBe("u1");
    expect(h.getUserIdMock).toHaveBeenCalledWith({
      cookie: "__Secure-authjs.session-token=token",
      secret: "test-secret",
    });
  });

  it("returns Err when cookies() rejects", async () => {
    h.cookiesMock.mockRejectedValueOnce(new Error("cookies failed"));

    const res = await getUserId();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error.name).toBe("UIUnknownError");
    expect(h.getUserIdMock).not.toHaveBeenCalled();
  });

  it("returns Err when token decoding fails", async () => {
    h.cookiesMock.mockResolvedValueOnce({
      toString: () => "authjs.session-token=token",
    });
    h.getUserIdMock.mockRejectedValueOnce(new Error("decode failed"));

    const res = await getUserId();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error.name).toBe("UIUnauthorizedError");
    expect(h.getUserIdMock).toHaveBeenCalledWith({
      cookie: "authjs.session-token=token",
      secret: "test-secret",
    });
  });

  it("returns Err when token has no userId", async () => {
    h.cookiesMock.mockResolvedValueOnce({
      toString: () => "authjs.session-token=token",
    });
    h.getUserIdMock.mockResolvedValueOnce(undefined);

    const res = await getUserId();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error.name).toBe("UIUnauthorizedError");
  });
});
