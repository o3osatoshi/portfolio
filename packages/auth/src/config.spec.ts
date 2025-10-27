import { describe, expect, it } from "vitest";

import { authConfig } from "./config";

describe("authConfig callbacks", () => {
  it("jwt adds user.id to token when user present", async () => {
    type JwtCb = (args: {
      token: Record<string, unknown>;
      user?: { id: string };
    }) => Promise<Record<string, unknown>>;
    const jwt = authConfig.callbacks?.jwt as unknown as JwtCb;
    expect(typeof jwt).toBe("function");

    const token = { foo: "bar" } satisfies Record<string, unknown>;
    const user = { id: "user-123" };

    const next = await jwt({ token, user });
    expect(next).toMatchObject({ id: "user-123", foo: "bar" });
  });

  it("jwt leaves token unchanged when user missing", async () => {
    type JwtCb = (args: {
      token: Record<string, unknown>;
      user?: { id: string };
    }) => Promise<Record<string, unknown>>;
    const jwt = authConfig.callbacks?.jwt as unknown as JwtCb;

    const token = { a: 1 } satisfies Record<string, unknown>;
    const next = await jwt({ token });
    expect(next).toEqual(token);
  });

  it("session attaches token.id to session.user.id when available", async () => {
    type SessionCb = (args: {
      session: { user?: { email?: string; id?: string; name?: string } };
      token: Record<string, unknown>;
    }) => Promise<{ user?: { email?: string; id?: string; name?: string } }>;
    const sessionCb = authConfig.callbacks?.session as unknown as SessionCb;
    expect(typeof sessionCb).toBe("function");

    const session = { user: { name: "Ada" } };
    const token = { id: "user-456" } satisfies Record<string, unknown>;

    const next = await sessionCb({ session, token });
    expect(next.user?.id).toBe("user-456");
    expect(next.user?.name).toBe("Ada");
  });

  it("session leaves session unchanged when token.id missing", async () => {
    type SessionCb = (args: {
      session: { user?: { email?: string; id?: string; name?: string } };
      token: Record<string, unknown>;
    }) => Promise<{ user?: { email?: string; id?: string; name?: string } }>;
    const sessionCb = authConfig.callbacks?.session as unknown as SessionCb;

    const session = { user: { email: "a@example.com" } };
    const token = {} as Record<string, unknown>;

    const next = await sessionCb({ session, token });
    expect(next).toEqual(session);
  });
});
