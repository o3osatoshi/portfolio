import { fetchClient } from "@/utils/fetch-client";
import { getPathName } from "@/utils/handle-nav";
import { Transaction } from "@repo/domain";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import { z } from "zod";

// TODO: props付きで渡るのイケていない感じ
// TODO: transaction関連の型と処理がフロントで点在しているのをどうにかしたい
const zTransactions = z.array(
  z.object({
    props: z.object({
      id: z.string(),
      type: z.string(),
      datetime: z.coerce.date(),
      amount: z.coerce.number(),
      price: z.coerce.number(),
      currency: z.string(),
      profitLoss: z.coerce.number().optional(),
      fee: z.coerce.number().optional(),
      feeCurrency: z.string().optional(),
      userId: z.string(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    }),
  }),
);

interface Props {
  userId?: string;
}

export async function getTransactions({
  userId,
}: Props | undefined = {}): Promise<Result<Transaction[], Error>> {
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
    const result = zTransactions.safeParse(data);
    if (!result.success) {
      console.error(result.error);
      return err(result.error);
    }
    const transactions = result.data.map((tx) => new Transaction(tx.props));
    return ok(transactions);
  });
}
