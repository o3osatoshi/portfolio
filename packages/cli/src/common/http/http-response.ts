import { err, ok, Result, ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import {
  type HttpErrorOptions,
  newHttpError,
  requestHttp,
} from "./http-request";

export type HttpJsonParser<T> = (input: unknown) => Result<T, RichError>;

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

export function readHttpJsonWithParser<T>(
  response: Response,
  options: HttpErrorOptions,
  parser: HttpJsonParser<T>,
): ResultAsync<T, RichError> {
  return readHttpJson(response, options).andThen(parser);
}

export function readHttpText(
  response: Response,
  options: HttpErrorOptions,
): ResultAsync<string, RichError> {
  return ResultAsync.fromPromise(response.text(), (cause) =>
    newHttpError(options, cause),
  );
}

export function requestHttpJsonWithParser<T>(
  url: string,
  init: RequestInit | undefined,
  options: {
    parser: HttpJsonParser<T>;
    read: HttpErrorOptions;
    request: HttpErrorOptions;
  },
): ResultAsync<T, RichError> {
  return requestHttp(url, init, options.request)
    .andThen((response) => expectOkHttpResponse(response, options.request))
    .andThen((response) =>
      readHttpJsonWithParser(response, options.read, options.parser),
    );
}
