import type { InferResponseType } from "@repo/interface/rpc-client";
import { errAsync, ResultAsync } from "neverthrow";

import { getMe } from "@/services/get-me";
import { getPath, getTag } from "@/utils/nav-handler";
import { createClient, createHeadersOption } from "@/utils/rpc-client";
import { deserializeError, newFetchError } from "@o3osatoshi/toolkit";

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
      createHeadersOption().map((headersOption) => ({
        headersOption,
        me,
      })),
    )
    .andThen(({ headersOption, me }) =>
      ResultAsync.fromPromise(
        client.api.private.labs.transactions.$get(undefined, {
          ...headersOption,
          init: {
            next: { tags: [getTag("labs-transactions", { userId: me.id })] },
          },
        }),
        (cause) => newFetchError({ action: "Fetch me", cause, request }),
      ),
    )
    .andThen((res) => {
      if (res.status === 401) {
        return errAsync(newFetchError({ kind: "Unauthorized", request }));
      }

      if (!res.ok) {
        return ResultAsync.fromPromise(res.json(), (cause) =>
          newFetchError({
            action: "Deserialize error body for getMe",
            cause,
            kind: "Serialization",
            request,
          }),
        ).andThen((body) => errAsync(deserializeError(body)));
      }

      return ResultAsync.fromPromise(res.json(), (cause) =>
        newFetchError({
          action: "Deserialize body for getMe",
          cause,
          kind: "Serialization",
          request,
        }),
      );
    });
}
