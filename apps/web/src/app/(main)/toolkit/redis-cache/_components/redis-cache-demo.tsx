"use client";

import { useCallback, useMemo, useState } from "react";

import { getHeavyProcessCached } from "@/services/get-heavy-process-cached";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@o3osatoshi/ui";

type DemoStatus = "error" | "idle" | "loading" | "success";

export default function RedisCacheDemoCard() {
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [clientDurationMs, setClientDurationMs] = useState<null | number>(null);
  const [fromCache, setFromCache] = useState<boolean | null>(null);
  const [timestamp, setTimestamp] = useState<null | string>(null);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "idle":
        return "Idle";
      case "loading":
        return "Loading…";
      case "success":
        return "Loaded";
      case "error":
        return "Failed";
      default:
        return status;
    }
  }, [status]);

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
          : String(error ?? "Unknown error"),
      );
      return;
    }

    const body = result.value;
    setStatus("success");
    setFromCache(body.cached);
    setTimestamp(body.timestamp);
  }, [status]);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setClientDurationMs(null);
    setFromCache(null);
    setTimestamp(null);
    setErrorMessage(null);
  }, []);

  const formatMs = (ms: null | number) =>
    ms === null ? "—" : `${ms.toFixed(0)} ms`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Redis cache demo</CardTitle>
        <CardDescription>
          Call a deliberately slow API endpoint (`/edge/public/heavy`) via the
          interface service and cache the result in Redis. Subsequent requests
          within the TTL should be served from cache and return much faster.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <dt className="text-neutral-500">Status</dt>
            <dd className="font-medium">{statusLabel}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-neutral-500">Source</dt>
            <dd className="font-medium">
              {fromCache === null
                ? "—"
                : fromCache
                  ? "Redis cache"
                  : "Slow API"}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-neutral-500">Server duration</dt>
            <dd className="font-medium">—</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-neutral-500">Client duration</dt>
            <dd className="font-medium">{formatMs(clientDurationMs)}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-neutral-500">Cached at</dt>
            <dd className="font-medium">
              {timestamp ? new Date(timestamp).toLocaleTimeString() : "—"}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-neutral-500">Value</dt>
            <dd className="break-all font-mono text-xs">{timestamp ?? "—"}</dd>
          </div>
        </dl>

        {errorMessage ? (
          <p className="text-red-600 text-sm">Error: {errorMessage}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button disabled={status === "loading"} onClick={handleFetch}>
            Fetch via cache
          </Button>
          <Button
            disabled={status === "loading"}
            onClick={handleReset}
            type="button"
            variant="outline"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
