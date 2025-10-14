import { err, ok, type Result } from "neverthrow";

import { getPathName } from "@/utils/handle-nav";
import { nextFetch } from "@/utils/next-fetch";
import type { Transactions } from "@/utils/validation";
import { transactionsSchema } from "@/utils/validation";

interface Props {
  userId?: string | undefined;
}

export async function getTransactions({
  userId,
}: Props | undefined = {}): Promise<Result<Transactions, Error>> {
  const search = userId === undefined ? undefined : { userId };
  return nextFetch({
    pathName: getPathName("labs-transactions"),
    search,
  }).andThen(({ body, status }) => {
    if (status < 200 || status >= 300) {
      console.error("getTransactions unexpected status", status);
      return err(new Error(`Unexpected status: ${status}`));
    }

    const result = transactionsSchema.safeParse(body);
    if (!result.success) {
      console.error(result.error);
      return err(result.error);
    }
    return ok(result.data);
  });
}
