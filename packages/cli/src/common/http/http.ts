import { err, ok, Result, ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

export type HttpErrorOptions = {
  action: string;
  code: string;
  kind?: RichError["kind"];
  layer?: RichError["layer"];
  reason: string;
};

export type JsonParser<T> = (input: unknown) => Result<T, RichError>;

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

export function readParsedJson<T>(
  response: Response,
  options: HttpErrorOptions,
  parser: JsonParser<T>,
): ResultAsync<T, RichError> {
  return readHttpJson(response, options).andThen(parser);
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

export function requestJson(
  url: string,
  init: RequestInit | undefined,
  options: {
    read: HttpErrorOptions;
    request: HttpErrorOptions;
  },
): ResultAsync<unknown, RichError>;
export function requestJson<T>(
  url: string,
  init: RequestInit | undefined,
  options: {
    read: HttpErrorOptions;
    request: HttpErrorOptions;
  },
  parser: JsonParser<T>,
): ResultAsync<T, RichError>;
export function requestJson<T>(
  url: string,
  init: RequestInit | undefined,
  options: {
    read: HttpErrorOptions;
    request: HttpErrorOptions;
  },
  parser?: JsonParser<T>,
): ResultAsync<T | unknown, RichError> {
  return requestHttp(url, init, options.request)
    .andThen((response) => expectOkHttpResponse(response, options.request))
    .andThen((response) =>
      parser
        ? readParsedJson(response, options.read, parser)
        : readHttpJson(response, options.read),
    );
}
