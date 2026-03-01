import { errAsync, okAsync, Result, ResultAsync } from "neverthrow";

import {
  type NewRichError,
  type RichError,
  toRichError,
} from "@o3osatoshi/toolkit";

export function fromPromise<T>(
  promise: Promise<T>,
  fallback: Partial<NewRichError>,
): ResultAsync<T, RichError> {
  return ResultAsync.fromPromise(promise, (cause) =>
    toRichError(cause, fallback),
  );
}

export function fromThrowable<T>(
  fn: () => T,
  fallback: Partial<NewRichError>,
): Result<T, RichError> {
  return Result.fromThrowable(fn, (cause) => toRichError(cause, fallback))();
}

export function okVoidAsync(): ResultAsync<void, RichError> {
  return okAsync(undefined);
}

export function toAsync<T>(
  result: Result<T, RichError>,
): ResultAsync<T, RichError> {
  return result.match(
    (value) => okAsync(value),
    (error) => errAsync(error),
  );
}
