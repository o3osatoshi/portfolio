import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@o3osatoshi/ui";

export default function TransactionCardSkeleton() {
  const skeletonCards = ["a", "b", "c"];
  const detailLineWidths = [
    { id: "type", width: "w-48" },
    { id: "amount", width: "w-44" },
    { id: "price", width: "w-40" },
    { id: "currency", width: "w-36" },
    { id: "profitLoss", width: "w-52" },
    { id: "fee", width: "w-32" },
    { id: "feeCurrency", width: "w-40" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {skeletonCards.map((cardId) => (
        <Card aria-hidden="true" key={`transactions-skeleton-${cardId}`}>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-5 w-24" />
            </CardTitle>
            <CardDescription>
              <div className="flex gap-3">
                <div className="flex gap-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardDescription>
            <CardAction>
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {detailLineWidths.map((line) => (
                <Skeleton
                  key={`transactions-skeleton-line-${line.id}`}
                  className={`h-4 ${line.width}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
