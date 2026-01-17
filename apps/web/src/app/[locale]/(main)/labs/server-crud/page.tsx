import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import TransactionCard from "@/app/[locale]/(main)/labs/_components/transaction-card";
import CreateForm from "@/app/[locale]/(main)/labs/server-crud/_components/create-form";
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
  const tNav = await getTranslations("Nav");
  const t = await getTranslations("Transactions");
  const result = await getTransactions();
  const transactions = result.isErr() ? [] : result.value;

  return (
    <>
      <PageHeader title={tNav("labs-server-crud")} />
      <div className="flex flex-col gap-6">
        <CreateForm />
        {transactions.length === 0 ? (
          t("empty")
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => {
              return <TransactionCard key={tx.id} transaction={tx} />;
            })}
          </div>
        )}
      </div>
    </>
  );
}
