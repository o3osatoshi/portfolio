import DeleteButton from "@/app/(main)/labs/server-crud/_components/delete-button";
import EditDialog from "@/app/(main)/labs/server-crud/_components/edit-dialog";
import type { Transaction } from "@/utils/validation";
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

export default function TransactionCard({ transaction }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{transaction.type}</CardTitle>
        <CardDescription>
          <div className="flex gap-3">
            <div className="flex gap-1.5">
              <span>{transaction.datetime.toLocaleTimeString()}</span>
              <span>{transaction.datetime.toLocaleDateString()}</span>
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
            <span>Type: </span>
            <span>{transaction.type}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>Amount: </span>
            <span>{transaction.amount}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>Price: </span>
            <span>{transaction.price}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>Currency: </span>
            <span>{transaction.currency}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>ProfitLoss: </span>
            <span>{transaction.profitLoss}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>Fee: </span>
            <span>{transaction.fee}</span>
          </div>
          <div className="text-muted-foreground text-sm">
            <span>FeeCurrency: </span>
            <span>{transaction.feeCurrency}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
