import { getUserId } from "@repo/auth";

import TransactionCard from "@/app/(main)/labs/_components/transaction-card";
import CreateForm from "@/app/(main)/labs/server-crud/_components/create-form";
import { getTransactions } from "@/services/get-transactions";

// const getTransactions: () => Promise<(Transaction & { author: Pick<User, "name"> })[]> =
//   cache(async () => {
//     return prisma.transaction.findMany({
//       include: {
//         author: {
//           select: {
//             name: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//   });

export default async function Page() {
  const userId = await getUserId();

  const result = await getTransactions({ userId });
  if (result.isErr()) {
    return null;
  }
  const transactions = result.value;

  return (
    <div className="flex flex-col gap-6">
      <CreateForm />
      {transactions.length === 0 ? (
        "no transactions yet"
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((tx) => {
            return <TransactionCard key={tx.id} transaction={tx} />;
          })}
        </div>
      )}
    </div>
  );
}
