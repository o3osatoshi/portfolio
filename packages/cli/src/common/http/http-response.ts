import { err, ok, Result, ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { type HttpErrorOptions, newHttpError } from "./http-request";

export function decodeHttpJson(
  text: string,
  options: HttpErrorOptions,
): Result<unknown, RichError> {
  return Result.fromThrowable(
    (value: string) => JSON.parse(value) as unknown,
    (cause) => newHttpError(options, cause),
  )(text);
}

export function expectOkHttpResponse(
  response: Response,
  options: HttpErrorOptions,
): Result<Response, RichError> {
  if (!response.ok) {
    return err(
      newHttpError({
        ...options,
        reason: `${options.reason} (${response.status})`,
      }),
    );
  }

  return ok(response);
}

export function readHttpJson(
  response: Response,
  options: HttpErrorOptions,
): ResultAsync<unknown, RichError> {
  return ResultAsync.fromPromise(response.json(), (cause) =>
    newHttpError(options, cause),
  );
}

export function readHttpText(
  response: Response,
  options: HttpErrorOptions,
): ResultAsync<string, RichError> {
  return ResultAsync.fromPromise(response.text(), (cause) =>
    newHttpError(options, cause),
  );
}
