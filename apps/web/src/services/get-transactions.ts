import type { InferResponseType } from "@repo/interface/rpc-client";
import { ResultAsync } from "neverthrow";

import { getMe } from "@/services/get-me";
import { handleResponse } from "@/services/handle-response";
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
        (cause) => newFetchError({ action: "Fetch me", cause, request }),
      ),
    )
    .andThen((res) =>
      handleResponse<Transactions>(res, {
        context: "getTransactions",
        request,
      }),
    );
}
