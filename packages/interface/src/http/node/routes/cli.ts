import type {
  CreateTransactionResponse,
  GetTransactionsResponse,
} from "@repo/application";
import {
  CreateTransactionUseCase,
  DeleteTransactionUseCase,
  GetTransactionsUseCase,
  parseCreateTransactionRequest,
  parseDeleteTransactionRequest,
  parseGetTransactionsRequest,
  parseUpdateTransactionRequest,
  UpdateTransactionUseCase,
} from "@repo/application";
import type { AccessTokenPrin } from "@repo/auth";
import { type Context, Hono } from "hono";
import {
  err,
  errAsync,
  ok,
  okAsync,
  type Result,
  ResultAsync,
} from "neverthrow";

import {
  newRichError,
  type RichError,
  toHttpErrorResponse,
} from "@o3osatoshi/toolkit";

import { respondAsync } from "../../core";
import type { ContextEnv } from "../../core/types";
import type { Deps } from "../app";

export function buildCliRoutes(deps: Deps) {
  return new Hono<ContextEnv>()
    .use("/v1/*", async (c, next) => {
      const accessToken = extractBearerToken(c.req.header("authorization"));
      if (accessToken.isErr()) return errorResponse(c, accessToken.error);

      const principalResult = await deps.resolveAccessTokenPrin({
        accessToken: accessToken.value,
      });
      if (principalResult.isErr())
        return errorResponse(c, principalResult.error);

      c.set("accessTokenPrin", principalResult.value);
      c.get("requestLogger")?.setUserId?.(principalResult.value.userId);
      return await next();
    })
    .get("/v1/me", (c) => {
      const principal = c.get("accessTokenPrin") as AccessTokenPrin;
      return respondAsync<AccessTokenPrin>(c)(
        requireScope(principal, "transactions:read").map(() => principal),
      );
    })
    .get("/v1/transactions", (c) => {
      const principal = c.get("accessTokenPrin") as AccessTokenPrin;
      const getTransactions = new GetTransactionsUseCase(deps.transactionRepo);
      return respondAsync<GetTransactionsResponse>(c)(
        requireScope(principal, "transactions:read").andThen(() =>
          parseGetTransactionsRequest({
            userId: principal.userId,
          }).asyncAndThen((res) => getTransactions.execute(res)),
        ),
      );
    })
    .post("/v1/transactions", (c) => {
      const principal = c.get("accessTokenPrin") as AccessTokenPrin;
      const createTransaction = new CreateTransactionUseCase(
        deps.transactionRepo,
      );
      return respondAsync<CreateTransactionResponse>(c)(
        requireScope(principal, "transactions:write")
          .andThen(() =>
            ResultAsync.fromPromise(
              c.req.json<Record<string, unknown>>(),
              (cause) =>
                newRichError({
                  cause,
                  code: "CLI_REQUEST_BODY_INVALID",
                  details: {
                    action: "ParseCliCreateTransactionBody",
                    reason: "Request body must be valid JSON.",
                  },
                  i18n: { key: "errors.application.validation" },
                  isOperational: true,
                  kind: "Validation",
                  layer: "Presentation",
                }),
            ),
          )
          .andThen((body) =>
            parseCreateTransactionRequest({
              ...(body as Record<string, unknown>),
              userId: principal.userId,
            }),
          )
          .andThen((res) => createTransaction.execute(res)),
      );
    })
    .patch("/v1/transactions/:id", (c) => {
      const principal = c.get("accessTokenPrin") as AccessTokenPrin;
      const updateTransaction = new UpdateTransactionUseCase(
        deps.transactionRepo,
      );
      return respondAsync<void>(c)(
        requireScope(principal, "transactions:write")
          .andThen(() =>
            ResultAsync.fromPromise(
              c.req.json<Record<string, unknown>>(),
              (cause) =>
                newRichError({
                  cause,
                  code: "CLI_REQUEST_BODY_INVALID",
                  details: {
                    action: "ParseCliUpdateTransactionBody",
                    reason: "Request body must be valid JSON.",
                  },
                  i18n: { key: "errors.application.validation" },
                  isOperational: true,
                  kind: "Validation",
                  layer: "Presentation",
                }),
            ),
          )
          .andThen((body) =>
            parseUpdateTransactionRequest({
              ...(body as Record<string, unknown>),
              id: c.req.param("id"),
            }),
          )
          .andThen((res) => updateTransaction.execute(res, principal.userId)),
      );
    })
    .delete("/v1/transactions/:id", (c) => {
      const principal = c.get("accessTokenPrin") as AccessTokenPrin;
      const deleteTransaction = new DeleteTransactionUseCase(
        deps.transactionRepo,
      );
      return respondAsync<void>(c)(
        requireScope(principal, "transactions:write").andThen(() =>
          parseDeleteTransactionRequest({
            id: c.req.param("id"),
            userId: principal.userId,
          }).asyncAndThen((res) => deleteTransaction.execute(res)),
        ),
      );
    });
}

function errorResponse(c: Context<ContextEnv>, error: RichError) {
  c.set("error", error);
  const { body, statusCode } = toHttpErrorResponse(error);
  return c.json(body, { status: statusCode });
}

function extractBearerToken(
  authorization: null | string | undefined,
): Result<string, RichError> {
  if (!authorization) {
    return err(
      newRichError({
        code: "CLI_BEARER_TOKEN_MISSING",
        details: {
          action: "ExtractCliBearerToken",
          reason: "Authorization header is missing.",
        },
        i18n: { key: "errors.application.unauthorized" },
        isOperational: true,
        kind: "Unauthorized",
        layer: "Presentation",
      }),
    );
  }

  const matched = authorization.match(/^Bearer\s+(.+)$/i);
  if (!matched || !matched[1]) {
    return err(
      newRichError({
        code: "CLI_BEARER_TOKEN_MALFORMED",
        details: {
          action: "ExtractCliBearerToken",
          reason: "Authorization header must use Bearer scheme.",
        },
        i18n: { key: "errors.application.unauthorized" },
        isOperational: true,
        kind: "Unauthorized",
        layer: "Presentation",
      }),
    );
  }

  return ok(matched[1]);
}

function requireScope(
  principal: AccessTokenPrin,
  requiredScope: string,
): ResultAsync<void, RichError> {
  if (principal.scopes.includes(requiredScope)) {
    return okAsync(undefined);
  }

  return errAsync(
    newRichError({
      code: "CLI_SCOPE_FORBIDDEN",
      details: {
        action: "AuthorizeCliScope",
        reason: `Required scope is missing: ${requiredScope}`,
      },
      i18n: { key: "errors.application.forbidden" },
      isOperational: true,
      kind: "Forbidden",
      layer: "Presentation",
    }),
  );
}
