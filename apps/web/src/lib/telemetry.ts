import { env } from "@/env/server";
import { initNodeTelemetry } from "@o3osatoshi/telemetry/node";

let initialised = false;

export function ensureNodeTelemetryInitialized(): void {
  if (initialised) return;

  initNodeTelemetry({
    axiom: {
      apiToken: env.AXIOM_API_TOKEN,
      otlpEndpoint: env.AXIOM_OTLP_ENDPOINT,
    },
    dataset: "portfolio-logs",
    env: "production",
    serviceName: "portfolio-web",
  });

  initialised = true;
}
