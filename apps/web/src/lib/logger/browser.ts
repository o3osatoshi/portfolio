"use client";

import {
  createBrowserLogger,
  initBrowserLogger,
} from "@o3osatoshi/logging/browser";
import { createProxyTransport } from "@o3osatoshi/logging/proxy";

import { loggingDatasets, loggingServices, resolveLoggerEnv } from "./config";

export const LOGGING_PROXY_PATH = "/api/logger";

export function getWebBrowserLogger() {
  initWebBrowserLogger();
  return createBrowserLogger();
}

export function initWebBrowserLogger() {
  initBrowserLogger({
    datasets: loggingDatasets,
    env: resolveLoggerEnv(),
    minLevel: "info",
    service: loggingServices.browser,
    transport: createProxyTransport({
      flushIntervalMs: 1000,
      url: LOGGING_PROXY_PATH,
    }),
  });
}
