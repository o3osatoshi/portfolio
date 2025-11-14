import type { AuthConfig } from "@repo/auth";
import type { TransactionRepository } from "@repo/domain";
import type { Context, Next } from "hono";
import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Stub auth middlewares for Node app
const h = vi.hoisted(() => {
  const initAuthConfigMock = vi.fn(
    () => async (_c: Context, next: Next) => next(),
  );
  const verifyAuthPass = vi.fn(() => async (c: Context, next: Next) => {
    // @ts-expect-error
    c.set("authUser", {
      session: { user: { id: "u-1" } },
      user: { id: "u-1" },
    });
    return next();
  });
  const authHandlerMock = vi.fn(
    () => async (c: Context) => c.json({ auth: true }),
  );
  return { authHandlerMock, initAuthConfigMock, verifyAuthPass };
});

vi.mock("@repo/auth/middleware", () => ({
  authHandler: h.authHandlerMock,
  initAuthConfig: h.initAuthConfigMock,
  verifyAuth: h.verifyAuthPass,
}));

// Mock application layer for deterministic behavior
const a = vi.hoisted(() => {
  const parseGetTransactionsRequest = vi.fn((input: unknown) => okAsync(input));
  class GetTransactionsUseCase {
    execute() {
      return okAsync([
        {
          id: "t-1",
          amount: "1.0",
          createdAt: new Date(0),
          currency: "USD",
          datetime: new Date(0),
          price: "10.0",
          type: "BUY" as const,
          updatedAt: new Date(0),
          userId: "u-1",
        },
      ]);
    }
  }
  return { GetTransactionsUseCase, parseGetTransactionsRequest };
});

vi.mock("@repo/application", () => ({
  GetTransactionsUseCase: a.GetTransactionsUseCase,
  parseGetTransactionsRequest: a.parseGetTransactionsRequest,
}));

import { buildApp } from "./app";

describe("http/node app", () => {
  beforeEach(() => vi.clearAllMocks());

  function build() {
    const app = buildApp({
      authConfig: {} as AuthConfig,
      // repo is unused because use case is mocked
      transactionRepo: {} as TransactionRepository,
    });
    return app;
  }

  it("GET /api/healthz returns ok when authorized", async () => {
    const res = await build().request("/api/healthz");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("GET /api/labs/transactions returns list for authenticated user", async () => {
    const res = await build().request("/api/labs/transactions");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].userId).toBe("u-1");
    // Ensure input to parser used auth user id
    expect(a.parseGetTransactionsRequest).toHaveBeenCalledWith({
      userId: "u-1",
    });
  });

  it("GET /api/labs/transactions returns validation error when parser fails", async () => {
    // Make parser return Err
    a.parseGetTransactionsRequest.mockImplementationOnce(() =>
      // @ts-expect-error
      errAsync(new Error("bad")),
    );
    const res = await build().request("/api/labs/transactions");
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("GET /api/auth/some-route is handled by authHandler middleware", async () => {
    const res = await build().request("/api/auth/some-route");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ auth: true });
  });
});
