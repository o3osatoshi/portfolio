import { err, ok, Result, ResultAsync } from "neverthrow";
import type { z } from "zod";

import {
  newRichError,
  omitUndefined,
  type RichError,
} from "@o3osatoshi/toolkit";

import { makeCliSchemaParser } from "../zod-validation";

export type HttpErrorOptions = {
  action: string;
  code: string;
  kind?: RichError["kind"];
  layer?: RichError["layer"];
  reason: string;
};

type RequestJsonDecode<T extends z.ZodType = z.ZodType<unknown>> = {
  context: RequestJsonDecodeContext;
  schema: T;
};

type RequestJsonDecodeContext = {
  action: string;
  code: string;
  context: string;
  fallbackHint?: string | undefined;
};

type RequestJsonInputBase = {
  body?: RequestInit["body"];
  headers?: RequestInit["headers"];
  method?: string;
  read: HttpErrorOptions;
  request: HttpErrorOptions;
  url: string;
};

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
  parser: (input: unknown) => Result<T, RichError>,
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

export function requestJson<T extends z.ZodType>(
  request: {
    decode: RequestJsonDecode<T>;
  } & RequestJsonInputBase,
): ResultAsync<z.infer<T>, RichError>;
export function requestJson(
  request: RequestJsonInputBase,
): ResultAsync<unknown, RichError>;
export function requestJson<T extends z.ZodType>(
  request: {
    decode?: RequestJsonDecode<T> | undefined;
  } & RequestJsonInputBase,
): ResultAsync<unknown | z.infer<T>, RichError> {
  const init: RequestInit = omitUndefined({
    body: request.body,
    headers: request.headers,
    method: request.method,
  });

  return requestHttp(request.url, init, request.request)
    .andThen((response) => expectOkHttpResponse(response, request.request))
    .andThen((response) => {
      if (!request.decode) {
        return readHttpJson(response, request.read);
      }

      const parser = makeCliSchemaParser(
        request.decode.schema,
        request.decode.context,
      );

      return readParsedJson(response, request.read, parser);
    });
}
