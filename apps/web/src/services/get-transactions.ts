import type { InferResponseType } from "@repo/interface/rpc-client";
import { ResultAsync } from "neverthrow";

import { getMe } from "@/services/get-me";
import { handleResponse } from "@/utils/handle-response";
import { getPath, getTag } from "@/utils/nav-handler";
import { createClient, createHeaders } from "@/utils/rpc-client";
import { newFetchError } from "@o3osatoshi/toolkit";

export type Transaction = Transactions[number];

export type Transactions = InferResponseType<
  ReturnType<
    typeof createClient
  >["api"]["private"]["labs"]["transactions"]["$get"],
  200
>;

export function getTransactions(): ResultAsync<Transactions, Error> {
  const client = createClient();
  const request = { method: "GET", url: getPath("labs-transactions") };

  return getMe()
    .andThen((me) =>
      createHeaders().map((headers) => ({
        headers,
        me,
      })),
    )
    .andThen(({ headers, me }) =>
      ResultAsync.fromPromise(
        client.api.private.labs.transactions.$get(undefined, {
          ...headers,
          init: {
            next: { tags: [getTag("labs-transactions", { userId: me.id })] },
          },
        }),
        (cause) =>
          newFetchError({ action: "Fetch transactions", cause, request }),
      ),
    )
    .andThen((res) =>
      handleResponse<Transactions>(res, {
        context: "getTransactions",
        request,
      }),
    );
}

// NOTE: next-fetch example
// export function getTransactions(): ResultAsync<Transactions, Error> {
//   return ResultAsync.fromPromise(cookies(), (cause) =>
//     webUnknownError({
//       action: "ReadCookies",
//       cause,
//       reason: "Failed to read cookies",
//     }),
//   )
//     .andThen((cookies) =>
//       nextFetch({
//         headers: { Cookie: cookies.toString() },
//         path: getPath("labs-transactions"),
//       }),
//     )
//     .andThen((res) => {
//       if (!res.ok) {
//         return errAsync(deserializeError(res.body));
//       }
//       return parseWith(transactionsSchema, {
//         action: "ParseTransactionsResponse",
//         layer: "UI",
//       })(res.body);
//     });
// }
