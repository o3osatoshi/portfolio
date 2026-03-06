import { ok } from "neverthrow";
import type { Result } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import {
  type CliErrorPayload,
  toCliErrorMessage,
  toCliErrorPayload,
} from "./error-message";

export const cliOutputVersion = 1;

export type CliJsonEnvelope = CliJsonFailure | CliJsonSuccess;

export type CliJsonFailure = {
  command?: string;
  error: CliErrorPayload["error"];
  meta: CliOutputMeta;
  ok: false;
};

export type CliJsonSuccess = {
  command: string;
  message?: string;
  meta: CliOutputMeta;
  ok: true;
  value: unknown;
};

export type OutputMode = "json" | "text";

type CliOutputMeta = {
  version: typeof cliOutputVersion;
};

type CliPrintOptions = {
  debug?: boolean | undefined;
};

type CliPrintResult = Result<CliSuccessValue, RichError>;

type CliSuccessValue = {
  command: string;
  message?: string;
  value: unknown;
};

export function printCliError(
  error: RichError,
  outputMode: OutputMode,
  command?: string,
  options: CliPrintOptions = {},
): void {
  if (outputMode === "json") {
    const basePayload = toCliErrorPayload(error, { debug: options.debug });
    const payload: CliJsonFailure = {
      error: basePayload.error,
      meta: {
        version: cliOutputVersion,
      },
      ok: false,
      ...(command ? { command } : {}),
    };
    console.error(JSON.stringify(payload));
    return;
  }

  console.error(toCliErrorMessage(error, { debug: options.debug }));
}

export function printSuccessData(
  command: string,
  data: unknown,
  outputMode: OutputMode,
  textRenderer: (data: unknown) => void,
): void {
  if (outputMode === "json") {
    printCliResult(ok({ command, value: data }), outputMode);
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
    printCliResult(ok({ command, message, value: null }), outputMode);
    return;
  }

  console.log(message);
}

function printCliResult(result: CliPrintResult, outputMode: OutputMode): void {
  result.match(
    ({ command, message, value }) => {
      if (outputMode !== "json") return;
      const payload: CliJsonSuccess = {
        command,
        ...(message ? { message } : {}),
        meta: {
          version: cliOutputVersion,
        },
        ok: true,
        value,
      };
      console.log(JSON.stringify(payload));
    },
    (error) => {
      printCliError(error, outputMode);
    },
  );
}
