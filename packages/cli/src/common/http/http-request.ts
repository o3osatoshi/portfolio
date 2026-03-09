import { ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

export type HttpErrorOptions = {
  action: string;
  code: string;
  kind?: RichError["kind"];
  layer?: RichError["layer"];
  reason: string;
};

export function newHttpError(
  options: HttpErrorOptions,
  cause?: unknown,
): RichError {
  return newRichError({
    cause,
    code: options.code,
    details: {
      action: options.action,
      reason: options.reason,
    },
    isOperational: true,
    kind: options.kind ?? "Internal",
    layer: options.layer ?? "Presentation",
  });
}

export function requestHttp(
  url: string,
  init: RequestInit | undefined,
  options: HttpErrorOptions,
): ResultAsync<Response, RichError> {
  return ResultAsync.fromPromise(fetch(url, init), (cause) =>
    newHttpError(options, cause),
  );
}
