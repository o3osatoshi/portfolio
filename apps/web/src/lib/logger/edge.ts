import "server-only";

import { env } from "@/env/server";
import { createEdgeLogger, initEdgeLogger } from "@o3osatoshi/logging/edge";

import { loggingDatasets, loggingServices, resolveLoggerEnv } from "./config";

export function getWebEdgeLogger() {
  initWebEdgeLogger();
  return createEdgeLogger();
}

export function initWebEdgeLogger() {
  initEdgeLogger({
    client: { token: env.AXIOM_API_TOKEN },
    datasets: loggingDatasets,
    env: resolveLoggerEnv(),
    minLevel: "info",
    service: loggingServices.edge,
  });
}
