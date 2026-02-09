import type {
  GetFxQuoteRequest,
  GetTransactionsRequest,
} from "@repo/application";
import type { AuthConfig } from "@repo/auth";
import type { FxQuoteProvider, TransactionRepository } from "@repo/domain";
import type { Context, Next } from "hono";
import { err, ok, okAsync, type Result } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

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
  const parseGetFxQuoteRequest = vi.fn(
    (input: GetFxQuoteRequest): Result<GetFxQuoteRequest, RichError> =>
      ok(input),
  );
  class GetFxQuoteUseCase {
    execute() {
      return okAsync({
        asOf: new Date(0),
        base: "USD",
        quote: "JPY",
        rate: "150.0",
      });
    }
  }
  const parseGetTransactionsRequest = vi.fn(
    (
      input: GetTransactionsRequest,
    ): Result<GetTransactionsRequest, RichError> => ok(input),
  );
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
  return {
    GetFxQuoteUseCase,
    GetTransactionsUseCase,
    parseGetFxQuoteRequest,
    parseGetTransactionsRequest,
  };
});

vi.mock("@repo/application", () => ({
  GetFxQuoteUseCase: a.GetFxQuoteUseCase,
  GetTransactionsUseCase: a.GetTransactionsUseCase,
  parseGetFxQuoteRequest: a.parseGetFxQuoteRequest,
  parseGetTransactionsRequest: a.parseGetTransactionsRequest,
}));

import { buildApp } from "./app";

describe("http/node app", () => {
  beforeEach(() => vi.clearAllMocks());

  function build() {
    const app = buildApp({
      fxQuoteProvider: {} as FxQuoteProvider,
      authConfig: {} as AuthConfig,
      // repo is unused because use case is mocked
      transactionRepo: {} as TransactionRepository,
    });
    return app;
  }

  it("GET /api/public/healthz returns ok when authorized", async () => {
    const res = await build().request("/api/public/healthz");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ ok: true });
  });

  it("GET /api/private/labs/transactions returns list for authenticated user", async () => {
    const res = await build().request("/api/private/labs/transactions");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].userId).toBe("u-1");
    // Ensure input to parser used auth user id
    expect(a.parseGetTransactionsRequest).toHaveBeenCalledWith({
      userId: "u-1",
    });
  });

  it("GET /api/private/labs/transactions returns validation error when parser fails", async () => {
    // Make parser return Err
    a.parseGetTransactionsRequest.mockImplementationOnce(() =>
      err<GetTransactionsRequest, RichError>(
        newRichError({
          details: {
            reason: "bad",
          },
          isOperational: true,
          kind: "Validation",
          layer: "Application",
        }),
      ),
    );
    const res = await build().request("/api/private/labs/transactions");
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("GET /api/auth/some-route is handled by authHandler middleware", async () => {
    const res = await build().request("/api/auth/some-route");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ auth: true });
  });

  it("GET /api/public/exchange-rate returns the latest FX quote", async () => {
    const res = await build().request(
      "/api/public/exchange-rate?base=usd&quote=jpy",
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.base).toBe("USD");
    expect(body.quote).toBe("JPY");
    expect(a.parseGetFxQuoteRequest).toHaveBeenCalledWith({
      base: "usd",
      quote: "jpy",
    });
  });
});
