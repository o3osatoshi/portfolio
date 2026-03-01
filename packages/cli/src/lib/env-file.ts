import { config as dotenvConfig } from "dotenv";
import { errAsync, okAsync } from "neverthrow";

import { newRichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./cli-error-catalog";
import type { CliResultAsync } from "./types";

export function loadRuntimeEnvFile(path?: string): CliResultAsync<void> {
  if (!path) {
    return okAsync(undefined);
  }

  const loaded = dotenvConfig({
    override: false,
    path,
    quiet: true,
  });
  if (loaded.error) {
    return errAsync(
      newRichError({
        cause: loaded.error,
        code: cliErrorCodes.CLI_ENV_FILE_LOAD_FAILED,
        details: {
          action: "LoadCliRuntimeEnvFile",
          reason: `Failed to load env file: ${path}`,
        },
        isOperational: true,
        kind: "Validation",
        layer: "Presentation",
      }),
    );
  }

  return okAsync(undefined);
}
