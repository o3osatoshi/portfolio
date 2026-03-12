import { err, ok, type Result, type ResultAsync } from "neverthrow";
import type { z } from "zod";

import {
  buildHttpErrorFromResponse as buildToolkitHttpErrorFromResponse,
  decodeJsonText as decodeToolkitJsonText,
  fetchResponse,
  type FetchResponseRequest,
  type HttpErrorOptions,
  newRichError,
  omitUndefined,
  readResponseJson as readToolkitResponseJson,
  readResponseText as readToolkitResponseText,
  type RichError,
} from "@o3osatoshi/toolkit";

import { makeCliSchemaParser } from "../zod-validation";

export type FetchJsonDecode<T extends z.ZodType = z.ZodType<unknown>> = {
  context: FetchJsonDecodeContext;
  schema: T;
};

export type FetchJsonDecodeContext = {
  action: string;
  code: string;
  context: string;
  fallbackHint?: string | undefined;
};

type FetchJsonInputBase = {
  read: HttpErrorOptions;
  request: HttpErrorOptions;
  url: string;
} & JsonFetchInputBase;

type JsonFetchInputBase = {
  body?: RequestInit["body"];
  headers?: RequestInit["headers"];
  method?: string;
};

export function buildHttpErrorFromResponse(
  response: Response,
  bodyText: string,
  options: HttpErrorOptions,
): RichError {
  return buildToolkitHttpErrorFromResponse(response, bodyText, options);
}

export function decodeHttpJson(
  text: string,
  options: HttpErrorOptions,
): Result<unknown, RichError> {
  return decodeToolkitJsonText(text, options);
}

export function expectOkHttpResponse(
  response: Response,
  options: HttpErrorOptions,
): Result<Response, RichError> {
  if (!response.ok) {
    return err(
      newRichError({
        code: options.code,
        details: {
          action: options.action,
          reason: `${options.reason} (${response.status})`,
        },
        isOperational: true,
        kind: options.kind ?? "Internal",
        layer: options.layer ?? "Presentation",
      }),
    );
  }

  return ok(response);
}

export function fetchHttp(
  url: string,
  init: RequestInit | undefined,
  options: HttpErrorOptions,
): ResultAsync<Response, RichError> {
  return fetchResponse(
    omitUndefined({
      body: init?.body,
      headers: init?.headers,
      method: init?.method,
      signal: init?.signal ?? undefined,
      url,
    }),
    {
      error: options,
    },
  );
}

export function fetchJson<T extends z.ZodType>(
  request: {
    decode: FetchJsonDecode<T>;
  } & FetchJsonInputBase,
): ResultAsync<z.infer<T>, RichError>;

export function fetchJson(
  request: FetchJsonInputBase,
): ResultAsync<unknown, RichError>;

export function fetchJson<T extends z.ZodType>(
  request: {
    decode?: FetchJsonDecode<T> | undefined;
  } & FetchJsonInputBase,
): ResultAsync<unknown | z.infer<T>, RichError> {
  return runJsonFetch(
    (init) =>
      fetchResponse(buildFetchRequest(request.url, init), {
        error: request.request,
      }).andThen((response) => {
        if (!response.ok) {
          return readHttpText(response, request.read).andThen((text) =>
            err(buildHttpErrorFromResponse(response, text, request.request)),
          );
        }

        return readHttpJson(response, request.read);
      }),
    request,
    (json, decode) => makeCliSchemaParser(decode.schema, decode.context)(json),
  );
}

export function readHttpJson(
  response: Response,
  options: HttpErrorOptions,
): ResultAsync<unknown, RichError> {
  return readToolkitResponseJson(response, options);
}

export function readHttpText(
  response: Response,
  options: HttpErrorOptions,
): ResultAsync<string, RichError> {
  return readToolkitResponseText(response, options);
}

export function readParsedJson<T>(
  response: Response,
  options: HttpErrorOptions,
  parser: (input: unknown) => Result<T, RichError>,
): ResultAsync<T, RichError> {
  return readHttpJson(response, options).andThen(parser);
}

export function runJsonFetch<TDecode, TResult>(
  execute: (init: RequestInit) => ResultAsync<unknown, RichError>,
  request: {
    decode?: TDecode | undefined;
  } & JsonFetchInputBase,
  runDecode: (json: unknown, decode: TDecode) => Result<TResult, RichError>,
): ResultAsync<TResult | unknown, RichError> {
  return execute(buildFetchInit(request)).andThen((json) =>
    decodeJsonResult(json, request.decode, runDecode),
  );
}

function buildFetchInit(request: JsonFetchInputBase): RequestInit {
  return omitUndefined({
    body: request.body,
    headers: request.headers,
    method: request.method,
  });
}

function buildFetchRequest(
  url: string,
  init: RequestInit,
): FetchResponseRequest {
  return omitUndefined({
    body: init.body,
    headers: init.headers,
    method: init.method,
    signal: init.signal ?? undefined,
    url,
  });
}

function decodeJsonResult<TDecode, TResult>(
  json: unknown,
  decode: TDecode | undefined,
  runDecode: (json: unknown, decode: TDecode) => Result<TResult, RichError>,
): Result<TResult | unknown, RichError> {
  if (!decode) {
    return ok(json);
  }

  return runDecode(json, decode);
}
