import { createNodeLogger, initNodeLogger } from "@o3osatoshi/logging/node";

import { env } from "./env";

export function getFunctionsLogger() {
  initFunctionsLogger();
  return createNodeLogger();
}

export function initFunctionsLogger() {
  initNodeLogger({
    client: { token: env.AXIOM_API_TOKEN },
    datasets: {
      events: "events",
      metrics: "metrics",
    },
    env: resolveLoggerEnv(),
    flushOnEnd: true,
    minLevel: "info",
    service: "portfolio-functions",
  });
}

function resolveLoggerEnv() {
  const nodeEnv = process.env["NODE_ENV"];
  if (nodeEnv === "production") return "production";
  if (nodeEnv === "development") return "development";
  return "local";
}
