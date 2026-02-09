import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import CreateForm from "@/app/[locale]/(main)/labs/server-actions-crud/_components/create-form";
import TransactionCard from "@/app/[locale]/(main)/labs/server-actions-crud/_components/transaction-card";
import TransactionCardSkeleton from "@/app/[locale]/(main)/labs/server-actions-crud/_components/transaction-card-skeleton";
import { getTransactions } from "@/server/get-transactions";
import { resolveErrorMessage } from "@/utils/resolve-error-message";
import { Message } from "@o3osatoshi/ui";

interface Props {
  params: Promise<{ locale: string }>;
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "LabsServerCrud", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "LabsServerCrud", locale });

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />
      <div className="flex flex-col gap-6">
        <CreateForm locale={locale} />
        <Suspense fallback={<TransactionCardSkeleton />}>
          <TransactionsSection locale={locale} />
        </Suspense>
      </div>
    </>
  );
}

async function TransactionsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ namespace: "LabsServerCrud", locale });
  const result = await getTransactions();
  const transactions = result.isOk() ? result.value : [];
  const errorMessage = result.isErr()
    ? await resolveErrorMessage(result.error, locale)
    : undefined;

  if (errorMessage) {
    return <Message variant="destructive">{errorMessage}</Message>;
  }

  if (transactions.length === 0) {
    return t("sections.transactions.empty");
  }

  return (
    <div className="flex flex-col gap-2">
      {transactions.map((tx) => {
        return <TransactionCard key={tx.id} locale={locale} transaction={tx} />;
      })}
    </div>
  );
}
