import { encode, omitUndefined, type RichError } from "@o3osatoshi/toolkit";

import {
  type CliErrorPayload,
  toCliErrorMessage,
  toCliErrorPayload,
} from "./error-message";

export const cliOutputVersion = 1;

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

export function printFailure(
  error: RichError,
  outputMode: OutputMode,
  command?: string,
  options: CliPrintOptions = {},
): void {
  switch (outputMode) {
    case "text":
      console.error(toCliErrorMessage(error, { debug: options.debug }));
      return;
    case "json": {
      const basePayload = toCliErrorPayload(error, { debug: options.debug });
      const payload: CliJsonFailure = {
        ...omitUndefined({
          command,
        }),
        error: basePayload.error,
        meta: {
          version: cliOutputVersion,
        },
        ok: false,
      };
      const serialized = encode(payload);
      if (serialized.isErr()) {
        console.error(toCliErrorMessage(serialized.error));
        return;
      }
      console.error(serialized.value);
      return;
    }
  }
}

export function printSuccessData(
  command: string,
  data: unknown,
  outputMode: OutputMode,
  textRenderer: (data: unknown) => void,
): void {
  switch (outputMode) {
    case "json":
      printSuccessJson({ command, value: data }, outputMode);
      return;
    case "text":
      textRenderer(data);
      return;
  }
}

export function printSuccessMessage(
  command: string,
  message: string,
  outputMode: OutputMode,
): void {
  switch (outputMode) {
    case "json":
      printSuccessJson({ command, message, value: null }, outputMode);
      return;
    case "text":
      console.log(message);
      return;
  }
}

function printSuccessJson(
  result: { command: string; message?: string; value: unknown },
  outputMode: OutputMode,
): void {
  switch (outputMode) {
    case "text":
      return;
    case "json": {
      const payload: CliJsonSuccess = {
        command: result.command,
        ...omitUndefined({
          message: result.message,
        }),
        meta: {
          version: cliOutputVersion,
        },
        ok: true,
        value: result.value,
      };
      const serialized = encode(payload);
      if (serialized.isErr()) {
        console.error(toCliErrorMessage(serialized.error));
        return;
      }
      console.log(serialized.value);
      return;
    }
  }
}
