import type { Result } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { resolveRuntimeConfigFromEnv } from "./runtime-env";
import type { RuntimeConfig } from "./types";

export function getRuntimeConfig(): Result<RuntimeConfig, RichError> {
  return resolveRuntimeConfigFromEnv();
}
