import { z } from "zod";

import type { LoggingDatasets } from "@o3osatoshi/logging";
import { initEdgeLogger } from "@o3osatoshi/logging/edge";

const loggingDatasets = {
  events: "events",
  metrics: "metrics",
} satisfies LoggingDatasets;

const loggingService = "portfolio-edge";

let isInitialized = false;

const appEnvSchema = z.enum(["development", "local", "production", "staging"]);

const edgeLoggerEnvSchema = z.looseObject({
  APP_ENV: appEnvSchema,
  AXIOM_API_TOKEN: z.string().min(1),
});

export type EdgeLoggerEnv = z.infer<typeof edgeLoggerEnvSchema>;

export function initEdgeLogging(rawEnv: unknown) {
  if (isInitialized) return;

  const result = edgeLoggerEnvSchema.safeParse(rawEnv ?? {});
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error(`Invalid edge env: ${issues}`);
  }
  const env = result.data;

  initEdgeLogger({
    client: { token: env.AXIOM_API_TOKEN },
    datasets: loggingDatasets,
    env: env.APP_ENV,
    minLevel: "info",
    service: loggingService,
  });

  isInitialized = true;
}
