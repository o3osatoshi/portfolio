"use client";

import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import { getHeavyProcessCached } from "@/services/get-heavy-process-cached";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Message,
} from "@o3osatoshi/ui";

type DemoStatus = "error" | "idle" | "loading" | "success";

export default function RedisCacheDemoCard() {
  const t = useTranslations("RedisCacheDemo");
  const tCommon = useTranslations("Common");
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [clientDurationMs, setClientDurationMs] = useState<null | number>(null);
  const [fromCache, setFromCache] = useState<boolean | null>(null);
  const [timestamp, setTimestamp] = useState<null | string>(null);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const notAvailableLabel = tCommon("notAvailable");
  const unknownErrorLabel = t("unknownError");

  const statusLabel = useMemo(() => {
    switch (status) {
      case "idle":
        return t("status.idle");
      case "loading":
        return t("status.loading");
      case "success":
        return t("status.success");
      case "error":
        return t("status.error");
      default:
        return status;
    }
  }, [status, t]);

  const handleFetch = useCallback(async () => {
    if (status === "loading") return;

    setStatus("loading");
    setErrorMessage(null);

    const startedAt = performance.now();
    const result = await getHeavyProcessCached();
    const endedAt = performance.now();

    setClientDurationMs(endedAt - startedAt);

    if (result.isErr()) {
      const error = result.error;
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : String(error ?? unknownErrorLabel),
      );
      return;
    }

    const body = result.value;
    setStatus("success");
    setFromCache(body.cached);
    setTimestamp(body.timestamp);
  }, [status, unknownErrorLabel]);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setClientDurationMs(null);
    setFromCache(null);
    setTimestamp(null);
    setErrorMessage(null);
  }, []);

  const formatMs = useCallback(
    (ms: null | number) =>
      ms === null
        ? notAvailableLabel
        : t("millisecondsShort", { value: ms.toFixed(0) }),
    [notAvailableLabel, t],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t.rich("description", {
            endpoint: (chunks) => <code>{chunks}</code>,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <dt className="text-muted-foreground">{t("labels.status")}</dt>
            <dd className="font-medium">{statusLabel}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-muted-foreground">{t("labels.source")}</dt>
            <dd className="font-medium">
              {fromCache === null
                ? notAvailableLabel
                : fromCache
                  ? t("sourceValues.redisCache")
                  : t("sourceValues.slowApi")}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-muted-foreground">
              {t("labels.serverDuration")}
            </dt>
            <dd className="font-medium">{notAvailableLabel}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-muted-foreground">
              {t("labels.clientDuration")}
            </dt>
            <dd className="font-medium">{formatMs(clientDurationMs)}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-muted-foreground">{t("labels.cachedAt")}</dt>
            <dd className="font-medium">
              {timestamp
                ? new Date(timestamp).toLocaleTimeString()
                : notAvailableLabel}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-muted-foreground">{t("labels.value")}</dt>
            <dd className="break-all font-mono text-xs">
              {timestamp ?? notAvailableLabel}
            </dd>
          </div>
        </dl>

        {errorMessage ? (
          <Message variant="destructive">
            {tCommon("errorWithMessage", { message: errorMessage })}
          </Message>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button disabled={status === "loading"} onClick={handleFetch}>
            {t("buttons.fetch")}
          </Button>
          <Button
            disabled={status === "loading"}
            onClick={handleReset}
            type="button"
            variant="outline"
          >
            {t("buttons.reset")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
