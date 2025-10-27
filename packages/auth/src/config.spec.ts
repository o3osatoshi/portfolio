import { describe, expect, it } from "vitest";

import { authConfig } from "./config";

describe("authConfig callbacks", () => {
  it("jwt adds user.id to token when user present", async () => {
    const jwt = authConfig.callbacks?.jwt as NonNullable<
      typeof authConfig.callbacks
    >["jwt"];
    expect(jwt).toBeTypeOf("function");

    const token = { foo: "bar" } as Record<string, unknown>;
    const user = { id: "user-123" } as unknown as { id: string };

    const next = await jwt!({ token, user } as any);
    expect(next).toMatchObject({ id: "user-123", foo: "bar" });
  });

  it("jwt leaves token unchanged when user missing", async () => {
    const jwt = authConfig.callbacks?.jwt as NonNullable<
      typeof authConfig.callbacks
    >["jwt"];

    const token = { a: 1 } as Record<string, unknown>;
    const next = await jwt!({ token } as any);
    expect(next).toEqual(token);
  });

  it("session attaches token.id to session.user.id when available", async () => {
    const sessionCb = authConfig.callbacks?.session as NonNullable<
      typeof authConfig.callbacks
    >["session"];
    expect(sessionCb).toBeTypeOf("function");

    const session = { user: { name: "Ada" } } as any;
    const token = { id: "user-456" } as any;

    const next = await sessionCb!({ session, token } as any);
    expect(next.user?.id).toBe("user-456");
    expect(next.user?.name).toBe("Ada");
  });

  it("session leaves session unchanged when token.id missing", async () => {
    const sessionCb = authConfig.callbacks?.session as NonNullable<
      typeof authConfig.callbacks
    >["session"];

    const session = { user: { email: "a@example.com" } } as any;
    const token = {} as any;

    const next = await sessionCb!({ session, token } as any);
    expect(next).toEqual(session);
  });
});
