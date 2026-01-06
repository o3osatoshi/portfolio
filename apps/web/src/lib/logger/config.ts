import type { LoggingDatasets } from "@o3osatoshi/logging";
import type { Env } from "@o3osatoshi/toolkit";

export const loggingDatasets = {
  events: "events",
  metrics: "metrics",
} satisfies LoggingDatasets;

export const loggingServices = {
  browser: "portfolio-web-browser",
  edge: "portfolio-web-edge",
  node: "portfolio-web",
};

export function resolveLoggerEnv(): Env {
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === "production") return "production";
  if (nodeEnv === "development") return "development";
  return "local";
}
