import { omitUndefined, type RichError, serialize } from "@o3osatoshi/toolkit";

import {
  type FailurePayload,
  toFailureMessage,
  toFailurePayload,
} from "./error-message";

export const OutputVersion = 1;

export type FailureJson = {
  command?: string;
  error: FailurePayload["error"];
  meta: OutputMeta;
  ok: false;
};

export type OutputMode = "json" | "text";

export type SuccessJson = {
  command: string;
  message?: string;
  meta: OutputMeta;
  ok: true;
  value: unknown;
};

type OutputMeta = {
  version: typeof OutputVersion;
};

type PrintOptions = {
  debug?: boolean | undefined;
};

export function printFailure(
  error: RichError,
  outputMode: OutputMode,
  command?: string,
  options: PrintOptions = {},
): void {
  switch (outputMode) {
    case "text":
      console.error(toFailureMessage(error, { debug: options.debug }));
      return;
    case "json": {
      const basePayload = toFailurePayload(error, { debug: options.debug });
      const payload: FailureJson = {
        ...omitUndefined({
          command,
        }),
        error: basePayload.error,
        meta: {
          version: OutputVersion,
        },
        ok: false,
      };
      const serialized = serialize(payload);
      if (serialized.isErr()) {
        console.error(toFailureMessage(serialized.error));
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
      const payload: SuccessJson = {
        command: result.command,
        ...omitUndefined({
          message: result.message,
        }),
        meta: {
          version: OutputVersion,
        },
        ok: true,
        value: result.value,
      };
      const serialized = serialize(payload);
      if (serialized.isErr()) {
        console.error(toFailureMessage(serialized.error));
        return;
      }
      console.log(serialized.value);
      return;
    }
  }
}
