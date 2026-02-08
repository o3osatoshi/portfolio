import "server-only";

import { getUserId as authGetUserId } from "@repo/auth";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { cookies } from "next/headers";

import { env } from "@/env/server";
import {
  webErrorCodes,
  webInternalError,
  webUnauthorizedError,
} from "@/utils/web-error";
import type { RichError } from "@o3osatoshi/toolkit";

export function getUserId(): ResultAsync<string, RichError> {
  return ResultAsync.fromPromise(cookies(), (cause) =>
    webInternalError({
      action: "ReadCookies",
      cause,
      code: webErrorCodes.AUTH_COOKIE_READ_FAILED,
      reason: "Failed to read request cookies.",
    }),
  )
    .andThen((reqCookies) =>
      ResultAsync.fromPromise(
        authGetUserId({
          cookie: reqCookies.toString(),
          secret: env.AUTH_SECRET,
        }),
        (cause) =>
          webUnauthorizedError({
            action: "DecodeAuthToken",
            cause,
            code: webErrorCodes.AUTH_TOKEN_DECODE_FAILED,
            reason: "Failed to decode session token.",
          }),
      ),
    )
    .andThen((userId) =>
      userId
        ? okAsync(userId)
        : errAsync(
            webUnauthorizedError({
              action: "DecodeAuthToken",
              code: webErrorCodes.AUTH_USER_ID_MISSING,
              reason: "Session token is missing a user id.",
            }),
          ),
    );
}
