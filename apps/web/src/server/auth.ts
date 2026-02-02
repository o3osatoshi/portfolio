import "server-only";

import { getUserId as authGetUserId } from "@repo/auth";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { cookies } from "next/headers";

import { env } from "@/env/server";
import { webUnauthorizedError, webUnknownError } from "@/utils/web-error";

export function getUserId(): ResultAsync<string, Error> {
  return ResultAsync.fromPromise(cookies(), (cause) =>
    webUnknownError({
      action: "ReadCookies",
      cause,
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
              reason: "Session token is missing a user id.",
            }),
          ),
    );
}
