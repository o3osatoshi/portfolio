import { fetchClient } from "@/utils/fetch-client";
import { getPathName } from "@/utils/handle-nav";
import { transactionsSchema } from "@/lib/validation";
import type { Transactions } from "@/lib/validation";
import { type Result, ResultAsync, err, ok } from "neverthrow";

interface Props {
  userId?: string;
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
