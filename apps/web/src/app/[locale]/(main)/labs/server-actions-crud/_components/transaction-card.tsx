import { getTranslations } from "next-intl/server";

import DeleteButton from "@/app/[locale]/(main)/labs/server-actions-crud/_components/delete-button";
import EditDialog from "@/app/[locale]/(main)/labs/server-actions-crud/_components/edit-dialog";
import type { Transaction } from "@/server/get-transactions";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@o3osatoshi/ui";

interface Props {
  locale: string;
  transaction: Transaction;
}

export default async function TransactionCard({ locale, transaction }: Props) {
  const t = await getTranslations({ namespace: "LabsServerCrud", locale });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{transaction.type}</CardTitle>
        <CardDescription>
          <div className="flex gap-3">
            <div className="flex gap-1.5">
              <span>{new Date(transaction.datetime).toLocaleTimeString()}</span>
              <span>{new Date(transaction.datetime).toLocaleDateString()}</span>
            </div>
          </div>
        </CardDescription>
        <CardAction>
          <div className="flex gap-1">
            <EditDialog locale={locale} transaction={transaction} />
            <DeleteButton id={transaction.id} locale={locale} />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="text-muted-foreground text-sm">
            <span>{t("sections.transactions.fields.type")}: </span>
            <span>{transaction.type}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("sections.transactions.fields.amount")}: </span>
            <span>{transaction.amount}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("sections.transactions.fields.price")}: </span>
            <span>{transaction.price}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("sections.transactions.fields.currency")}: </span>
            <span>{transaction.currency}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("sections.transactions.fields.profitLoss")}: </span>
            <span>{transaction.profitLoss}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("sections.transactions.fields.fee")}: </span>
            <span>{transaction.fee}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("sections.transactions.fields.feeCurrency")}: </span>
            <span>{transaction.feeCurrency}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
