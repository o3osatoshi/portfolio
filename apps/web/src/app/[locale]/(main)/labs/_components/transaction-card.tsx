import { getTranslations } from "next-intl/server";

import DeleteButton from "@/app/[locale]/(main)/labs/server-crud/_components/delete-button";
import EditDialog from "@/app/[locale]/(main)/labs/server-crud/_components/edit-dialog";
import type { Transaction } from "@/services/get-transactions";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@o3osatoshi/ui";

interface Props {
  transaction: Transaction;
}

export default async function TransactionCard({ transaction }: Props) {
  const t = await getTranslations("Transactions");

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
            <EditDialog transaction={transaction} />
            <DeleteButton id={transaction.id} />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="text-muted-foreground text-sm">
            <span>{t("fields.type")}: </span>
            <span>{transaction.type}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("fields.amount")}: </span>
            <span>{transaction.amount}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("fields.price")}: </span>
            <span>{transaction.price}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("fields.currency")}: </span>
            <span>{transaction.currency}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("fields.profitLoss")}: </span>
            <span>{transaction.profitLoss}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("fields.fee")}: </span>
            <span>{transaction.fee}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>{t("fields.feeCurrency")}: </span>
            <span>{transaction.feeCurrency}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
