import type { LoggingDatasets } from "@o3osatoshi/logging";
import { createNodeLogger, initNodeLogger } from "@o3osatoshi/logging/node";

import { env } from "./env";

const loggingDatasets = {
  events: "events",
  metrics: "metrics",
} satisfies LoggingDatasets;

const loggingService = "portfolio-functions";

export function getFunctionsLogger() {
  initFunctionsLogger();
  return createNodeLogger();
}

export function initFunctionsLogger() {
  initNodeLogger({
    client: { token: env.AXIOM_API_TOKEN },
    datasets: loggingDatasets,
    env: resolveLoggerEnv(),
    flushOnEnd: true,
    minLevel: "info",
    service: loggingService,
  });
}

function resolveLoggerEnv() {
  const nodeEnv = process.env["NODE_ENV"];
  if (nodeEnv === "production") return "production";
  if (nodeEnv === "development") return "development";
  return "local";
}
