import { err, ok, type Result, ResultAsync } from "neverthrow";

import { fetchClient } from "@/utils/fetch-client";
import { getPathName } from "@/utils/handle-nav";
import type { Transactions } from "@/utils/validation";
import { transactionsSchema } from "@/utils/validation";

interface Props {
  userId?: string | undefined;
}

export async function getTransactions({
  userId,
}: Props | undefined = {}): Promise<Result<Transactions, Error>> {
  const search = userId === undefined ? undefined : { userId };
  return ResultAsync.fromPromise(
    fetchClient({
      pathName: getPathName("labs-transactions"),
      search,
    }),
    (error: unknown) => {
      if (error instanceof Error) {
        return error;
      }
      return new Error("unknown error");
    },
  ).andThen((data) => {
    const result = transactionsSchema.safeParse(data);
    if (!result.success) {
      console.error(result.error);
      return err(result.error);
    }
    return ok(result.data);
  });
}
