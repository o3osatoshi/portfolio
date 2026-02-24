import { zValidator } from "@hono/zod-validator";
import type {
  CreateTransactionRequest,
  CreateTransactionResponse,
  GetTransactionsResponse,
  UpdateTransactionRequest,
} from "@repo/application";
import {
  createTransactionRequestSchema,
  CreateTransactionUseCase,
  DeleteTransactionUseCase,
  GetTransactionsUseCase,
  parseCreateTransactionRequest,
  parseDeleteTransactionRequest,
  parseGetTransactionsRequest,
  parseUpdateTransactionRequest,
  updateTransactionRequestSchema,
  UpdateTransactionUseCase,
} from "@repo/application";
import type { AccessTokenPrincipal } from "@repo/auth";
import { type Context, Hono } from "hono";
import {
  err,
  errAsync,
  ok,
  okAsync,
  type Result,
  type ResultAsync,
} from "neverthrow";

import {
  newRichError,
  type RichError,
  toHttpErrorResponse,
} from "@o3osatoshi/toolkit";

import { respondZodError } from "../../core";
import { respondAsync } from "../../core";
import type { ContextEnv } from "../../core/types";
import type { Deps } from "../app";
import { cliErrorCodes } from "./cli-error-catalog";

const CLI_SCOPES = {
  transactionsRead: "transactions:read",
  transactionsWrite: "transactions:write",
} as const;
type CliScope = (typeof CLI_SCOPES)[keyof typeof CLI_SCOPES];
type CreateTransactionBody = Omit<CreateTransactionRequest, "userId">;
const createTransactionBodySchema = createTransactionRequestSchema.omit({
  userId: true,
});
const updateTransactionBodySchema = updateTransactionRequestSchema
  .omit({ id: true })
  .passthrough();
type UpdateTransactionBody = UpdateTransactionRequest;

export function buildCliRoutes(deps: Deps) {
  return new Hono<ContextEnv>()
    .use("/v1/*", async (c, next) => {
      const accessToken = extractBearerToken(c.req.header("authorization"));
      if (accessToken.isErr()) return errorResponse(c, accessToken.error);

      const result = await deps.resolveAccessTokenPrincipal({
        accessToken: accessToken.value,
      });
      if (result.isErr()) return errorResponse(c, result.error);

      c.set("accessTokenPrincipal", result.value);
      c.get("requestLogger")?.setUserId?.(result.value.userId);
      return await next();
    })
    .get("/v1/me", (c) => {
      return respondAsync<AccessTokenPrincipal>(c)(
        requireScope(
          c.get("accessTokenPrincipal"),
          CLI_SCOPES.transactionsRead,
        ),
      );
    })
    .get("/v1/transactions", (c) => {
      const getTransactions = new GetTransactionsUseCase(deps.transactionRepo);
      return respondAsync<GetTransactionsResponse>(c)(
        requireScope(
          c.get("accessTokenPrincipal"),
          CLI_SCOPES.transactionsRead,
        ).andThen((principal) =>
          parseGetTransactionsRequest({
            userId: principal.userId,
          }).asyncAndThen((res) => getTransactions.execute(res)),
        ),
      );
    })
    .post(
      "/v1/transactions",
      zValidator("json", createTransactionBodySchema, respondZodError),
      (c) => {
        const createTransaction = new CreateTransactionUseCase(
          deps.transactionRepo,
        );
        const body = c.req.valid("json") as CreateTransactionBody;
        return respondAsync<CreateTransactionResponse>(c)(
          requireScope(
            c.get("accessTokenPrincipal"),
            CLI_SCOPES.transactionsWrite,
          ).andThen((principal) =>
            parseCreateTransactionRequest({
              ...body,
              userId: principal.userId,
            }).asyncAndThen((res) => createTransaction.execute(res)),
          ),
        );
      },
    )
    .patch(
      "/v1/transactions/:id",
      zValidator("json", updateTransactionBodySchema, respondZodError),
      (c) => {
        const updateTransaction = new UpdateTransactionUseCase(
          deps.transactionRepo,
        );
        const body = c.req.valid("json") as UpdateTransactionBody;
        return respondAsync<void>(c)(
          requireScope(
            c.get("accessTokenPrincipal"),
            CLI_SCOPES.transactionsWrite,
          ).andThen((principal) =>
            parseUpdateTransactionRequest({
              ...body,
              id: c.req.param("id"),
            }).asyncAndThen((res) =>
              updateTransaction.execute(res, principal.userId),
            ),
          ),
        );
      },
    )
    .delete("/v1/transactions/:id", (c) => {
      const deleteTransaction = new DeleteTransactionUseCase(
        deps.transactionRepo,
      );
      return respondAsync<void>(c)(
        requireScope(
          c.get("accessTokenPrincipal"),
          CLI_SCOPES.transactionsWrite,
        ).andThen((principal) =>
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
        code: cliErrorCodes.BEARER_TOKEN_MISSING,
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
        code: cliErrorCodes.BEARER_TOKEN_MALFORMED,
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
  principal: AccessTokenPrincipal | undefined,
  requiredScope: CliScope,
): ResultAsync<AccessTokenPrincipal, RichError> {
  if (principal === undefined) {
    return errAsync(
      newRichError({
        code: cliErrorCodes.SCOPE_FORBIDDEN,
        details: {
          action: "AuthorizeCliScope",
          reason: "Access token principal is missing.",
        },
        i18n: { key: "errors.application.forbidden" },
        isOperational: true,
        kind: "Forbidden",
        layer: "Presentation",
      }),
    );
  }

  if (principal.scopes.includes(requiredScope)) {
    return okAsync(principal);
  }

  return errAsync(
    newRichError({
      code: cliErrorCodes.SCOPE_FORBIDDEN,
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
