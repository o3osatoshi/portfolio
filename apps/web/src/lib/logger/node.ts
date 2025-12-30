import "server-only";

import { env } from "@/env/server";
import { createNodeLogger, initNodeLogger } from "@o3osatoshi/logging/node";

import { loggingDatasets, loggingServices, resolveLoggerEnv } from "./config";

export function getWebNodeLogger() {
  initWebNodeLogger();
  return createNodeLogger();
}

export function initWebNodeLogger() {
  initNodeLogger({
    client: { token: env.AXIOM_API_TOKEN },
    datasets: loggingDatasets,
    env: resolveLoggerEnv(),
    flushOnEnd: true,
    minLevel: "info",
    service: loggingServices.node,
  });
}
