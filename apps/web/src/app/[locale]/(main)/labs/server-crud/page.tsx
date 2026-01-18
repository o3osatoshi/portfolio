import type { Metadata } from "next";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "LabsServerCrud", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("LabsServerCrud");
  const result = await getTransactions();
  const transactions = result.isErr() ? [] : result.value;

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />
      <div className="flex flex-col gap-6">
        <CreateForm />
        {transactions.length === 0 ? (
          t("sections.transactions.empty")
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
