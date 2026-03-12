import { err, ok, Result, ResultAsync } from "neverthrow";
import type { z } from "zod";

import {
  type JsonObject,
  type JsonValue,
  newRichError,
  omitUndefined,
  type RichError,
  truncate,
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

export type HttpErrorOptions = {
  action: string;
  code: string;
  kind?: RichError["kind"];
  layer?: RichError["layer"];
  reason: string;
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

const HTTP_ERROR_TEXT_LIMIT = 500;

export function buildFetchInit(request: JsonFetchInputBase): RequestInit {
  return omitUndefined({
    body: request.body,
    headers: request.headers,
    method: request.method,
  });
}

export function buildHttpErrorFromResponse(
  response: Response,
  bodyText: string,
  options: HttpErrorOptions,
): RichError {
  const body = deserializeErrorBody(bodyText);
  const responseErrorCode = extractResponseErrorCode(body);

  return newRichError({
    code: responseErrorCode ?? options.code,
    details: {
      action: options.action,
      reason:
        extractResponseErrorReason(body) ??
        formatHttpErrorReason(response, options.reason),
    },
    isOperational: true,
    kind: options.kind ?? resolveHttpStatusKind(response.status),
    layer: options.layer ?? "Presentation",
    meta: buildHttpErrorMeta(response, body, responseErrorCode),
  });
}

export function decodeHttpJson(
  text: string,
  options: HttpErrorOptions,
): Result<unknown, RichError> {
  return Result.fromThrowable(
    (value: string) => JSON.parse(value) as unknown,
    (cause) => newHttpError(options, cause),
  )(text);
}

export function decodeJsonResult<TDecode, TResult>(
  json: unknown,
  decode: TDecode | undefined,
  runDecode: (json: unknown, decode: TDecode) => Result<TResult, RichError>,
): Result<TResult | unknown, RichError> {
  if (!decode) {
    return ok(json);
  }

  return runDecode(json, decode);
}

export function deserializeErrorBody(text: string): JsonValue | null | string {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  try {
    return JSON.parse(trimmed) as JsonValue;
  } catch {
    return trimmed;
  }
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

export function fetchHttp(
  url: string,
  init: RequestInit | undefined,
  options: HttpErrorOptions,
): ResultAsync<Response, RichError> {
  return ResultAsync.fromPromise(fetch(url, init), (cause) =>
    newHttpError(options, cause),
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
      fetchHttp(request.url, init, request.request).andThen((response) => {
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

export function resolveHttpStatusKind(
  status: number,
):
  | "BadGateway"
  | "BadRequest"
  | "Conflict"
  | "Forbidden"
  | "NotFound"
  | "RateLimit"
  | "Unauthorized"
  | "Unprocessable" {
  if (status === 400) return "BadRequest";
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "NotFound";
  if (status === 409) return "Conflict";
  if (status === 422) return "Unprocessable";
  if (status === 429) return "RateLimit";
  return "BadGateway";
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

function buildHttpErrorMeta(
  response: Response,
  body: JsonValue | null | string,
  responseErrorCode: string | undefined,
): JsonObject {
  const meta: JsonObject = {
    responseStatus: response.status,
  };

  if (response.statusText) {
    meta["responseStatusText"] = response.statusText;
  }

  if (responseErrorCode) {
    meta["responseErrorCode"] = responseErrorCode;
  }

  if (body && typeof body === "object") {
    meta["responseBody"] = body;
  } else if (typeof body === "string") {
    meta["responseBodyText"] = truncate(body, HTTP_ERROR_TEXT_LIMIT);
  }

  return meta;
}

function extractResponseErrorCode(
  body: JsonValue | null | string,
): string | undefined {
  if (!isJsonObject(body)) {
    return undefined;
  }

  const code = body["code"];
  return typeof code === "string" && code.length > 0 ? code : undefined;
}

function extractResponseErrorReason(
  body: JsonValue | null | string,
): string | undefined {
  if (typeof body === "string") {
    return truncate(body, HTTP_ERROR_TEXT_LIMIT);
  }

  if (!isJsonObject(body)) {
    return undefined;
  }

  return (
    readNestedString(body, ["details", "reason"]) ??
    readNestedString(body, ["reason"]) ??
    readNestedString(body, ["message"]) ??
    readNestedString(body, ["error_description"]) ??
    readNestedString(body, ["error"])
  );
}

function formatHttpErrorReason(
  response: Response,
  fallbackReason: string,
): string {
  if (response.statusText) {
    return `${fallbackReason} (${response.status}): ${response.statusText}`;
  }

  return `${fallbackReason} (${response.status}).`;
}

function isJsonObject(value: JsonValue | null | string): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNestedString(
  source: JsonObject,
  path: string[],
): string | undefined {
  let current: JsonValue | undefined = source;

  for (const key of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }

    current = current[key];
  }

  return typeof current === "string" && current.length > 0
    ? current
    : undefined;
}
