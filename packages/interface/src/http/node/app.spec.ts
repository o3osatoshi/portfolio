import type {
  CreateTransactionRequest,
  DeleteTransactionRequest,
  GetFxQuoteRequest,
  GetTransactionsRequest,
  UpdateTransactionRequest,
} from "@repo/application";
import type { AuthConfig } from "@repo/auth";
import type {
  FxQuoteProvider,
  TransactionRepository,
  UserId,
} from "@repo/domain";
import type { Context, Next } from "hono";
import { err, errAsync, ok, okAsync, type Result } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

function asUserId(value: string): UserId {
  return value as UserId;
}

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

  const parseCreateTransactionRequest = vi.fn(
    (
      input: CreateTransactionRequest,
    ): Result<CreateTransactionRequest, RichError> => ok(input),
  );
  class CreateTransactionUseCase {
    execute(req: CreateTransactionRequest) {
      return okAsync({
        id: "t-2",
        amount: req.amount,
        createdAt: new Date(0),
        currency: req.currency,
        datetime: req.datetime,
        price: req.price,
        type: req.type,
        updatedAt: new Date(0),
        userId: req.userId,
      });
    }
  }

  const parseUpdateTransactionRequest = vi.fn(
    (
      input: UpdateTransactionRequest,
    ): Result<UpdateTransactionRequest, RichError> => ok(input),
  );
  class UpdateTransactionUseCase {
    execute() {
      return okAsync(undefined);
    }
  }

  const parseDeleteTransactionRequest = vi.fn(
    (
      input: DeleteTransactionRequest,
    ): Result<DeleteTransactionRequest, RichError> => ok(input),
  );
  class DeleteTransactionUseCase {
    execute() {
      return okAsync(undefined);
    }
  }

  return {
    CreateTransactionUseCase,
    DeleteTransactionUseCase,
    GetFxQuoteUseCase,
    GetTransactionsUseCase,
    parseCreateTransactionRequest,
    parseDeleteTransactionRequest,
    parseGetFxQuoteRequest,
    parseGetTransactionsRequest,
    parseUpdateTransactionRequest,
    UpdateTransactionUseCase,
  };
});

vi.mock("@repo/application", () => ({
  CreateTransactionUseCase: a.CreateTransactionUseCase,
  DeleteTransactionUseCase: a.DeleteTransactionUseCase,
  GetFxQuoteUseCase: a.GetFxQuoteUseCase,
  GetTransactionsUseCase: a.GetTransactionsUseCase,
  parseCreateTransactionRequest: a.parseCreateTransactionRequest,
  parseDeleteTransactionRequest: a.parseDeleteTransactionRequest,
  parseGetFxQuoteRequest: a.parseGetFxQuoteRequest,
  parseGetTransactionsRequest: a.parseGetTransactionsRequest,
  parseUpdateTransactionRequest: a.parseUpdateTransactionRequest,
  UpdateTransactionUseCase: a.UpdateTransactionUseCase,
}));

import { buildApp } from "./app";

describe("http/node app", () => {
  beforeEach(() => vi.clearAllMocks());

  function build(
    resolveCliPrincipal?: Parameters<typeof buildApp>[0]["resolveCliPrincipal"],
  ) {
    return buildApp({
      fxQuoteProvider: {} as FxQuoteProvider,
      authConfig: {} as AuthConfig,
      resolveCliPrincipal:
        resolveCliPrincipal ??
        ((_) =>
          okAsync({
            issuer: "https://example.auth0.com",
            scopes: ["transactions:read", "transactions:write"],
            subject: "auth0|u-1",
            userId: asUserId("u-1"),
          })),
      transactionRepo: {} as TransactionRepository,
    });
  }

  it("GET /api/public/healthz returns ok", async () => {
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
    expect(a.parseGetTransactionsRequest).toHaveBeenCalledWith({
      userId: "u-1",
    });
  });

  it("GET /api/cli/v1/me returns resolved principal", async () => {
    const res = await build().request("/api/cli/v1/me", {
      headers: { Authorization: "Bearer token" },
    });
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      issuer: "https://example.auth0.com",
      scopes: ["transactions:read", "transactions:write"],
      subject: "auth0|u-1",
      userId: "u-1",
    });
  });

  it("GET /api/cli/v1/transactions requires Bearer token", async () => {
    const res = await build().request("/api/cli/v1/transactions");
    expect(res.status).toBe(401);
  });

  it("GET /api/cli/v1/transactions enforces read scope", async () => {
    const res = await build((_) =>
      okAsync({
        issuer: "https://example.auth0.com",
        scopes: ["transactions:write"],
        subject: "auth0|u-1",
        userId: asUserId("u-1"),
      }),
    ).request("/api/cli/v1/transactions", {
      headers: { Authorization: "Bearer token" },
    });
    expect(res.status).toBe(403);
  });

  it("POST /api/cli/v1/transactions injects userId from principal", async () => {
    const res = await build().request("/api/cli/v1/transactions", {
      body: JSON.stringify({
        amount: "1",
        currency: "USD",
        datetime: "2024-01-01T00:00:00.000Z",
        price: "100",
        type: "BUY",
        userId: "malicious",
      }),
      headers: {
        Authorization: "Bearer token",
        "content-type": "application/json",
      },
      method: "POST",
    });
    expect(res.status).toBe(200);
    expect(a.parseCreateTransactionRequest).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "u-1" }),
    );
  });

  it("PATCH /api/cli/v1/transactions/:id uses path id", async () => {
    const res = await build().request("/api/cli/v1/transactions/t-1", {
      body: JSON.stringify({ id: "forged", amount: "2" }),
      headers: {
        Authorization: "Bearer token",
        "content-type": "application/json",
      },
      method: "PATCH",
    });
    expect(res.status).toBe(200);
    expect(a.parseUpdateTransactionRequest).toHaveBeenCalledWith(
      expect.objectContaining({ id: "t-1" }),
    );
  });

  it("DELETE /api/cli/v1/transactions/:id injects principal userId", async () => {
    const res = await build().request("/api/cli/v1/transactions/t-1", {
      headers: { Authorization: "Bearer token" },
      method: "DELETE",
    });
    expect(res.status).toBe(200);
    expect(a.parseDeleteTransactionRequest).toHaveBeenCalledWith({
      id: "t-1",
      userId: "u-1",
    });
  });

  it("returns 401 when resolveCliPrincipal fails", async () => {
    const res = await build((_) =>
      errAsync(
        newRichError({
          code: "OIDC_ACCESS_TOKEN_INVALID",
          details: { action: "VerifyOidcAccessToken", reason: "invalid" },
          i18n: { key: "errors.application.unauthorized" },
          isOperational: true,
          kind: "Unauthorized",
          layer: "External",
        }),
      ),
    ).request("/api/cli/v1/me", {
      headers: { Authorization: "Bearer invalid" },
    });
    expect(res.status).toBe(401);
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

  it("GET /api/private/labs/transactions returns validation error when parser fails", async () => {
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
});
