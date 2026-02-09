import "server-only";

import { getUserId as authGetUserId } from "@repo/auth";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { cookies } from "next/headers";

import { env } from "@/env/server";
import {
  newWebError,
  webErrorCodes,
  webErrorI18nKeys,
} from "@/utils/web-error";
import type { RichError } from "@o3osatoshi/toolkit";

export function getUserId(): ResultAsync<string, RichError> {
  return ResultAsync.fromPromise(cookies(), (cause) =>
    newWebError({
      action: "ReadCookies",
      cause,
      code: webErrorCodes.AUTH_COOKIE_READ_FAILED,
      i18n: { key: webErrorI18nKeys.INTERNAL },
      isOperational: false,
      kind: "Internal",
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
          newWebError({
            action: "DecodeAuthToken",
            cause,
            code: webErrorCodes.AUTH_TOKEN_DECODE_FAILED,
            i18n: { key: webErrorI18nKeys.UNAUTHORIZED },
            isOperational: true,
            kind: "Unauthorized",
            reason: "Failed to decode session token.",
          }),
      ),
    )
    .andThen((userId) =>
      userId
        ? okAsync(userId)
        : errAsync(
            newWebError({
              action: "DecodeAuthToken",
              code: webErrorCodes.AUTH_USER_ID_MISSING,
              i18n: { key: webErrorI18nKeys.UNAUTHORIZED },
              isOperational: true,
              kind: "Unauthorized",
              reason: "Session token is missing a user id.",
            }),
          ),
    );
}
