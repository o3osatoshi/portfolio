import { errAsync, ResultAsync } from "neverthrow";
import { cookies } from "next/headers";

import { getPath } from "@/utils/handle-nav";
import { nextFetch } from "@/utils/next-fetch";
import type { Transactions } from "@/utils/validation";
import { transactionsSchema } from "@/utils/validation";
import { webUnknownError } from "@/utils/web-error";
import { deserializeError, parseWith } from "@o3osatoshi/toolkit";

export function getTransactions(): ResultAsync<Transactions, Error> {
  return ResultAsync.fromPromise(cookies(), (cause) =>
    webUnknownError({
      action: "ReadCookies",
      cause,
      reason: "Failed to read cookies",
    }),
  )
    .andThen((cookies) =>
      nextFetch({
        headers: { Cookie: cookies.toString() },
        path: getPath("labs-transactions"),
      }),
    )
    .andThen((res) => {
      if (!res.ok) {
        return errAsync(deserializeError(res.body));
      }
      return parseWith(transactionsSchema, {
        action: "ParseTransactionsResponse",
        layer: "UI",
      })(res.body);
    });
}
