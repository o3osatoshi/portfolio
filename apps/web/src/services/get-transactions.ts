import type { InferResponseType } from "@repo/interface/rpc-client";
import { err, ok } from "neverthrow";

import { getPath } from "@/utils/nav-handler";
import { createClient, createHeadersOption } from "@/utils/rpc-client";
import { deserializeError, newFetchError } from "@o3osatoshi/toolkit";

export type Transaction = Transactions[number];

export type Transactions = InferResponseType<
  ReturnType<
    typeof createClient
  >["api"]["private"]["labs"]["transactions"]["$get"],
  200
>;

export async function getTransactions() {
  const client = createClient();
  const headersOption = await createHeadersOption();
  const res = await client.api.private.labs.transactions.$get(undefined, {
    ...headersOption,
    init: {
      next: {
        tags: [getPath("labs-transactions")],
      },
    },
  });
  if (res.status === 401) {
    return err(
      newFetchError({
        kind: "Unauthorized",
        request: {
          method: "GET",
          url: getPath("labs-transactions"),
        },
      }),
    );
  }
  if (!res.ok) {
    const body = await res.json();
    return err(deserializeError(body));
  }
  return ok(await res.json());
}
