import TransactionCard from "@/app/(main)/labs/_components/transaction-card";
import { getTransactions } from "@/app/(main)/labs/_services/get-transactions";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth();
  const userId = session?.user?.id;

  const result = await getTransactions({ userId });
  if (result.isErr()) {
    return null;
  }
  const transactions = result.value;

  if (transactions.length === 0) {
    return "no transactions yet";
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {transactions.map((transaction) => {
          return (
            <TransactionCard key={transaction.id} transaction={transaction} />
          );
        })}
      </div>
    </div>
  );
}
