import TransactionCard from "@/app/(main)/labs/_components/transaction-card";
import { getTransactions } from "@/app/(main)/labs/_services/get-transactions";
import CreateForm from "@/app/(main)/labs/server-crud/_components/create-form";
import { auth } from "@/lib/auth";

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
  const session = await auth();
  const userId = session?.user?.id;

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
