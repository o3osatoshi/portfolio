"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { sleep } from "@o3osatoshi/toolkit";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@o3osatoshi/ui";

type DemoStatus = "canceled" | "completed" | "error" | "idle" | "running";

const DURATION_MS = 3000;

export function SleepDemoCard() {
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [errorMessage, setErrorMessage] = useState<null | string>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<null | number>(null);
  const startedAtRef = useRef<null | number>(null);

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
      abortControllerRef.current?.abort(new Error("component unmounted"));
      clearTicker();
    };
  }, [clearTicker]);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "idle":
        return "Idle";
      case "running":
        return "Running sleep…";
      case "completed":
        return "Completed";
      case "canceled":
        return "Canceled";
      case "error":
        return "Failed";
      default:
        return status;
    }
  }, [status]);

  const handleStart = useCallback(async () => {
    if (status === "running") return;

    abortControllerRef.current?.abort(new Error("restarted"));
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
      const error = result.error;
      if (error instanceof Error && error.name === "InfraCanceledError") {
        setStatus("canceled");
        setErrorMessage(error.message);
      } else if (error instanceof Error) {
        setStatus("error");
        setErrorMessage(error.message);
      } else {
        setStatus("error");
        setErrorMessage(String(error));
      }
    }

    clearTicker();
    setElapsedMs((elapsed) => {
      const startedAt = startedAtRef.current;
      return startedAt === null ? elapsed : Date.now() - startedAt;
    });
    abortControllerRef.current = null;
    startedAtRef.current = null;
  }, [clearTicker, startTicker, status]);

  const handleCancel = useCallback(() => {
    if (status !== "running") return;
    abortControllerRef.current?.abort(new Error("canceled by user"));
  }, [status]);

  const secondsElapsed = (elapsedMs / 1000).toFixed(1);
  const progress = Math.min(100, Math.round((elapsedMs / DURATION_MS) * 100));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep helper demo</CardTitle>
        <CardDescription>
          Simulate a cancellable pause that rejects with an infrastructure error
          when aborted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <dt className="text-neutral-500">Status</dt>
            <dd className="font-medium">{statusLabel}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-neutral-500">Progress</dt>
            <dd className="font-medium">{progress}%</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-neutral-500">Elapsed</dt>
            <dd className="font-medium">{secondsElapsed}s</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-neutral-500">Duration</dt>
            <dd className="font-medium">{DURATION_MS / 1000}s</dd>
          </div>
        </dl>

        {errorMessage ? (
          <p className="text-red-600 text-sm">Error: {errorMessage}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button disabled={status === "running"} onClick={handleStart}>
            Start 3s sleep
          </Button>
          <Button
            disabled={status !== "running"}
            onClick={handleCancel}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
