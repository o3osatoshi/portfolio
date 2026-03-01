import { errAsync, okAsync, Result, ResultAsync } from "neverthrow";

import { type NewRichError, toRichError } from "@o3osatoshi/toolkit";

import type { CliResult, CliResultAsync } from "./types";

export function fromPromise<T>(
  promise: Promise<T>,
  fallback: Partial<NewRichError>,
): CliResultAsync<T> {
  return ResultAsync.fromPromise(promise, (cause) =>
    toRichError(cause, fallback),
  );
}

export function fromThrowable<T>(
  fn: () => T,
  fallback: Partial<NewRichError>,
): CliResult<T> {
  return Result.fromThrowable(fn, (cause) => toRichError(cause, fallback))();
}

export function okVoidAsync(): CliResultAsync<void> {
  return okAsync(undefined);
}

export function toAsync<T>(result: CliResult<T>): CliResultAsync<T> {
  return result.match(
    (value) => okAsync(value),
    (error) => errAsync(error),
  );
}
