import { errAsync, type ResultAsync } from "neverthrow";

import { getPath } from "@/utils/handle-nav";
import { nextFetch } from "@/utils/next-fetch";
import type { Transactions } from "@/utils/validation";
import { transactionsSchema } from "@/utils/validation";
import { deserializeError, parseWith } from "@o3osatoshi/toolkit";

interface Props {
  userId?: string | undefined;
}

export function getTransactions({
  userId,
}: Props): ResultAsync<Transactions, Error> {
  const search = userId === undefined ? undefined : { userId };

  return nextFetch({
    path: getPath("labs-transactions"),
    search,
  }).andThen((res) => {
    if (!res.ok) {
      const err = deserializeError(res.body);
      return errAsync(err);
    }
    return parseWith(transactionsSchema, {
      action: "ParseTransactionsResponse",
      layer: "UI",
    })(res.body);
  });
}
