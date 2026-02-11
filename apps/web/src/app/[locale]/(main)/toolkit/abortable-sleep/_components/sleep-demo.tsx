"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { interpretErrorMessage, sleep } from "@o3osatoshi/toolkit";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Message,
} from "@o3osatoshi/ui";

type DemoStatus = "canceled" | "completed" | "error" | "idle" | "running";

const DURATION_MS = 3000;

export default function SleepDemoCard() {
  const t = useTranslations("ToolkitAbortableSleep");
  const tError = useTranslations();
  const cardKey = "sections.demo.card";
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<null | number>(null);
  const startedAtRef = useRef<null | number>(null);
  const durationSeconds = DURATION_MS / 1000;
  const reasonComponentUnmounted = t(`${cardKey}.reasons.componentUnmounted`);
  const reasonRestarted = t(`${cardKey}.reasons.restarted`);
  const reasonCanceledByUser = t(`${cardKey}.reasons.canceledByUser`);

  const clearTicker = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTicker = useCallback(() => {
    clearTicker();
    intervalRef.current = window.setInterval(() => {
      const startedAt = startedAtRef.current;
      if (startedAt === null) return;
      setElapsedMs(Date.now() - startedAt);
    }, 100);
  }, [clearTicker]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort(new Error(reasonComponentUnmounted));
      clearTicker();
    };
  }, [clearTicker, reasonComponentUnmounted]);

  const statusLabel = t(`${cardKey}.status.${status}`);

  const handleStart = useCallback(async () => {
    if (status === "running") return;

    abortControllerRef.current?.abort(new Error(reasonRestarted));
    clearTicker();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    startedAtRef.current = Date.now();
    setStatus("running");
    setElapsedMs(0);
    setErrorMessage(null);
    startTicker();

    const result = await sleep(DURATION_MS, { signal: controller.signal });

    if (result.isOk()) {
      setStatus("completed");
    } else {
      const isSleepAborted = result.error.code === "SLEEP_ABORTED";

      const status = isSleepAborted ? "canceled" : "error";
      const message = interpretErrorMessage(result.error, {
        fallback: isSleepAborted
          ? {
              i18n: {
                key: "ToolkitAbortableSleep.sections.demo.card.errors.sleepAborted",
              },
            }
          : {
              i18n: { key: "Common.unknownError" },
            },
        t: tError,
      });

      setStatus(status);
      setErrorMessage(message);
    }

    clearTicker();
    setElapsedMs((elapsed) => {
      const startedAt = startedAtRef.current;
      return startedAt === null ? elapsed : Date.now() - startedAt;
    });
    abortControllerRef.current = null;
    startedAtRef.current = null;
  }, [clearTicker, reasonRestarted, startTicker, status, tError]);

  const handleCancel = useCallback(() => {
    if (status !== "running") return;
    abortControllerRef.current?.abort(new Error(reasonCanceledByUser));
  }, [reasonCanceledByUser, status]);

  const secondsElapsed = (elapsedMs / 1000).toFixed(1);
  const progress = Math.min(100, Math.round((elapsedMs / DURATION_MS) * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(`${cardKey}.title`)}</CardTitle>
        <CardDescription>{t(`${cardKey}.description`)}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <dt className="text-muted-foreground">
              {t(`${cardKey}.labels.status`)}
            </dt>
            <dd className="font-medium">{statusLabel}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-muted-foreground">
              {t(`${cardKey}.labels.progress`)}
            </dt>
            <dd className="font-medium">
              {t(`${cardKey}.progressPercent`, { value: progress })}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-muted-foreground">
              {t(`${cardKey}.labels.elapsed`)}
            </dt>
            <dd className="font-medium">
              {t(`${cardKey}.secondsShort`, { value: secondsElapsed })}
            </dd>
          </div>
          <div className="space-y-1">
            <dt className="text-muted-foreground">
              {t(`${cardKey}.labels.duration`)}
            </dt>
            <dd className="font-medium">
              {t(`${cardKey}.secondsShort`, { value: durationSeconds })}
            </dd>
          </div>
        </dl>

        {errorMessage ? (
          <Message variant="destructive">{errorMessage}</Message>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button disabled={status === "running"} onClick={handleStart}>
            {t(`${cardKey}.buttons.start`, { seconds: durationSeconds })}
          </Button>
          <Button
            disabled={status !== "running"}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            {t(`${cardKey}.buttons.cancel`)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
