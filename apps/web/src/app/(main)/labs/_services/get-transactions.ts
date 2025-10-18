import { err, ok, type ResultAsync } from "neverthrow";

import { getPath } from "@/utils/handle-nav";
import { nextFetch } from "@/utils/next-fetch";
import type { Transactions } from "@/utils/validation";
import { transactionsSchema } from "@/utils/validation";

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
    if (res.status < 200 || res.status >= 300) {
      console.error("getTransactions unexpected status", res.status);
      return err(new Error(`Unexpected status: ${res.status}`));
    }

    const result = transactionsSchema.safeParse(res.body);
    if (!result.success) {
      console.error(result.error);
      return err(result.error);
    }
    return ok(result.data);
  });
}
