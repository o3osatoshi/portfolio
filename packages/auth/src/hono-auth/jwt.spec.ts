import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    getTokenMock: vi.fn(),
  };
});

vi.mock("@auth/core/jwt", () => ({
  getToken: h.getTokenMock,
}));

import { getUserId, resolveAuthCookieName } from "./jwt";

describe("hono-auth/jwt resolveAuthCookieName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("prefers secure cookie name when present", () => {
    const header =
      "__Secure-authjs.session-token=secure; authjs.session-token=plain";
    expect(resolveAuthCookieName(header)).toBe("__Secure-authjs.session-token");
  });

  it("falls back to plain cookie name when secure cookie missing", () => {
    expect(resolveAuthCookieName("authjs.session-token=plain")).toBe(
      "authjs.session-token",
    );
  });
});

describe("hono-auth/jwt getUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("returns token.id when available and wires secure cookie", async () => {
    const cookie =
      "__Secure-authjs.session-token=secure; authjs.session-token=plain";
    const secret = "secret";
    h.getTokenMock.mockResolvedValueOnce({ id: "u-1" });

    const userId = await getUserId({ cookie, secret });

    expect(userId).toBe("u-1");
    expect(h.getTokenMock).toHaveBeenCalledWith({
      cookieName: "__Secure-authjs.session-token",
      req: { headers: { cookie } },
      salt: "__Secure-authjs.session-token",
      secret,
    });
  });

  it("falls back to token.sub when token.id is missing", async () => {
    h.getTokenMock.mockResolvedValueOnce({ sub: "u-sub" });

    const userId = await getUserId({
      cookie: "authjs.session-token=plain",
      secret: "secret",
    });

    expect(userId).toBe("u-sub");
  });

  it("returns undefined when token is null", async () => {
    h.getTokenMock.mockResolvedValueOnce(null);

    const userId = await getUserId({
      cookie: "authjs.session-token=plain",
      secret: "secret",
    });

    expect(userId).toBeUndefined();
  });

  it("returns undefined when token has no id/sub string", async () => {
    h.getTokenMock.mockResolvedValueOnce({ id: 123, sub: null });

    const userId = await getUserId({
      cookie: "authjs.session-token=plain",
      secret: "secret",
    });

    expect(userId).toBeUndefined();
  });
});
