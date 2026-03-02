import type { RichError } from "@o3osatoshi/toolkit";

import { toCliErrorMessage, toCliErrorPayload } from "./cli-error-message";

export const cliOutputSchemaVersion = "v1";

export type OutputMode = "json" | "text";
export type OutputModeOption = "auto" | OutputMode;

type JsonSuccessPayload = {
  command: string;
  data?: unknown;
  message?: string;
  meta: {
    schemaVersion: typeof cliOutputSchemaVersion;
  };
  ok: true;
};

export function printCliError(error: RichError, outputMode: OutputMode): void {
  if (outputMode === "json") {
    console.error(
      JSON.stringify({
        ...toCliErrorPayload(error),
        meta: {
          schemaVersion: cliOutputSchemaVersion,
        },
      }),
    );
    return;
  }
  console.error(toCliErrorMessage(error));
}

export function printSuccessData(
  command: string,
  data: unknown,
  outputMode: OutputMode,
  textRenderer: (data: unknown) => void,
): void {
  if (outputMode === "json") {
    printJsonSuccess({
      command,
      data,
      meta: {
        schemaVersion: cliOutputSchemaVersion,
      },
      ok: true,
    });
    return;
  }
  textRenderer(data);
}

export function printSuccessMessage(
  command: string,
  message: string,
  outputMode: OutputMode,
): void {
  if (outputMode === "json") {
    printJsonSuccess({
      command,
      message,
      meta: {
        schemaVersion: cliOutputSchemaVersion,
      },
      ok: true,
    });
    return;
  }
  console.log(message);
}

function printJsonSuccess(payload: JsonSuccessPayload): void {
  console.log(JSON.stringify(payload));
}
