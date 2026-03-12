import { Result, ResultAsync } from "neverthrow";

import { resolveAbortSignal } from "../asynchronous";
import {
  type Kind,
  newRichError,
  type NewRichError,
  type RichError,
} from "../error";
import { omitUndefined } from "../omit-undefined";
import { truncate } from "../truncate";
import type { JsonObject, JsonValue } from "../types";
import { newFetchError } from "./fetch-error";
import { type HttpStatusLike, httpStatusToKind } from "./http-utils";
import type { HttpRequest } from "./response-types";

const HTTP_ERROR_TEXT_LIMIT = 500;

/**
 * Optional fetch transport configuration.
 *
 * Use this when callers need to override the underlying `fetch`
 * implementation or customize the shape of transport-layer errors.
 *
 * @public
 */
export type FetchResponseOptions = {
  /**
   * Optional overrides applied when transport execution fails before a
   * response is produced.
   */
  error?: {
    /** Processing step recorded in {@link RichError.details}. */
    action?: string | undefined;
    /** Stable application error code to apply to transport failures. */
    code?: string | undefined;
    /** Explicit error classification for transport failures. */
    kind?: Kind | undefined;
    /** Explicit layer override for the resulting {@link RichError}. */
    layer?: RichError["layer"] | undefined;
    /** Human-readable fallback reason for transport failures. */
    reason?: string | undefined;
  };
  /** Alternate fetch implementation, mainly for tests or custom runtimes. */
  fetch?: typeof fetch | undefined;
};

/**
 * Request input accepted by {@link fetchResponse}.
 *
 * This type intentionally mirrors the subset of `RequestInit` needed by the
 * helper while requiring the normalized request metadata from {@link HttpRequest}.
 *
 * @public
 */
export type FetchResponseRequest = {
  /** Request body forwarded to the underlying `fetch` call. */
  body?: RequestInit["body"];
  /** Request headers forwarded to the underlying `fetch` call. */
  headers?: RequestInit["headers"];
  /** Abort signal supplied by the caller. */
  signal?: AbortSignal;
  /** Optional timeout budget in milliseconds. */
  timeoutMs?: number;
} & HttpRequest;

/**
 * Error options used by HTTP helper primitives.
 *
 * These options describe how low-level helpers should shape {@link RichError}
 * values when transport execution, response reading, or generic HTTP fallback
 * normalization fails.
 *
 * @public
 */
export type HttpErrorOptions = {
  /** Processing step recorded in {@link RichError.details}. */
  action: string;
  /** Stable application error code used for the resulting {@link RichError}. */
  code: string;
  /** Explicit error classification override. */
  kind?: Kind | undefined;
  /** Explicit error layer override. */
  layer?: RichError["layer"] | undefined;
  /** Human-readable fallback reason when no better message is available. */
  reason: string;
};

/**
 * Build a structured HTTP error from a deserialized response payload.
 *
 * @remarks
 * This helper is intended for non-2xx responses after the caller has already
 * deserialized the payload. It extracts common error fields such as `code`,
 * `reason`, `message`, `error_description`, and `error`, then records the
 * normalized response metadata in `meta`.
 *
 * @param response - HTTP status metadata.
 * @param payload - Parsed response payload or fallback text payload.
 * @param options - Error shaping options.
 * @returns Structured {@link RichError}.
 * @public
 */
export function buildHttpErrorFromPayload(
  response: HttpStatusLike,
  payload: unknown,
  options: HttpErrorOptions,
): RichError {
  const responseErrorCode = extractResponseErrorCode(payload);

  return newRichError({
    code: responseErrorCode ?? options.code,
    details: {
      action: options.action,
      reason:
        extractResponseErrorReason(payload) ??
        formatHttpErrorReason(response, options.reason),
    },
    isOperational: true,
    kind: options.kind ?? httpStatusToKind(response.status),
    layer: options.layer ?? "External",
    meta: buildHttpErrorMeta(response, payload, responseErrorCode),
  });
}

/**
 * Build a structured HTTP error from raw response text.
 *
 * @remarks
 * The helper first attempts to deserialize `bodyText` as JSON. Structured
 * payloads are passed through the same extraction rules used by
 * {@link buildHttpErrorFromPayload}. Plain text payloads are truncated before
 * being recorded in `meta.responseBodyText`.
 *
 * @param response - HTTP status metadata.
 * @param bodyText - Raw response text.
 * @param options - Error shaping options.
 * @returns Structured {@link RichError}.
 * @public
 */
export function buildHttpErrorFromResponse(
  response: HttpStatusLike,
  bodyText: string,
  options: HttpErrorOptions,
): RichError {
  return buildHttpErrorFromPayload(
    response,
    deserializeErrorBody(bodyText),
    options,
  );
}

/**
 * Decode JSON text into an arbitrary JSON value.
 *
 * @remarks
 * This helper does not apply any schema validation. It only converts a JSON
 * string into the corresponding JavaScript value and normalizes parse failures
 * as {@link RichError}.
 *
 * @param text - JSON string to decode.
 * @param options - Error shaping options.
 * @returns Decoded JSON or a structured error.
 * @public
 */
export function decodeJsonText(
  text: string,
  options: HttpErrorOptions,
): Result<unknown, RichError> {
  return Result.fromThrowable(
    (value: string) => JSON.parse(value) as unknown,
    (cause) => newHttpError(options, cause),
  )(text);
}

/**
 * Execute a low-level HTTP fetch request and normalize transport failures.
 *
 * @remarks
 * `fetchResponse` does not inspect `response.ok` and does not read the
 * response body. It only constructs `RequestInit`, applies timeout/abort
 * coordination, executes `fetch`, and converts transport failures into
 * {@link RichError}.
 *
 * @param request - Request metadata and init-like fields.
 * @param options - Optional fetcher and error override configuration.
 * @returns Fetch response or a transport {@link RichError}.
 * @public
 */
export function fetchResponse(
  request: FetchResponseRequest,
  options: FetchResponseOptions = {},
): ResultAsync<Response, RichError> {
  const { cleanup, signal } = resolveAbortSignal({
    signal: request.signal,
    timeoutMs: request.timeoutMs,
  });

  const init = omitUndefined({
    body: request.body,
    headers: request.headers,
    method: request.method,
    signal,
  });

  return ResultAsync.fromPromise(
    (options.fetch ?? fetch)(request.url, init),
    (cause) =>
      remapFetchErrorLayer(
        newFetchError({
          cause,
          code: options.error?.code,
          details: omitUndefined({
            action: options.error?.action,
            reason: options.error?.reason,
          }),
          kind: options.error?.kind,
          request: {
            method: request.method ?? "GET",
            url: request.url,
          },
        }),
        options.error?.layer,
      ),
  )
    .andTee(() => {
      cleanup();
    })
    .orTee(() => {
      cleanup();
    });
}

/**
 * Read response JSON and normalize parse failures.
 *
 * @remarks
 * This helper calls `response.json()` directly. It does not inspect status
 * codes or `content-type`, and it does not perform schema validation.
 *
 * @param response - Fetch response.
 * @param options - Error shaping options.
 * @returns Parsed JSON or a structured error.
 * @public
 */
export function readResponseJson(
  response: Response,
  options: HttpErrorOptions,
): ResultAsync<unknown, RichError> {
  return ResultAsync.fromPromise(response.json(), (cause) =>
    newHttpError(options, cause),
  );
}

/**
 * Read response text and normalize read failures.
 *
 * @remarks
 * This helper is useful for non-2xx flows where the caller wants to inspect a
 * raw error body before deciding how to normalize it.
 *
 * @param response - Fetch response.
 * @param options - Error shaping options.
 * @returns Response text or a structured error.
 * @public
 */
export function readResponseText(
  response: Response,
  options: HttpErrorOptions,
): ResultAsync<string, RichError> {
  return ResultAsync.fromPromise(response.text(), (cause) =>
    newHttpError(options, cause),
  );
}

function buildHttpErrorMeta(
  response: HttpStatusLike,
  payload: unknown,
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

  if (isJsonContainer(payload)) {
    meta["responseBody"] = payload;
  } else if (typeof payload === "string") {
    meta["responseBodyText"] = truncate(payload, HTTP_ERROR_TEXT_LIMIT);
  }

  return meta;
}

function deserializeErrorBody(text: string): JsonValue | null | string {
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

function extractResponseErrorCode(payload: unknown): string | undefined {
  if (!isJsonObject(payload)) {
    return undefined;
  }

  const code = payload["code"];
  return typeof code === "string" && code.length > 0 ? code : undefined;
}

function extractResponseErrorReason(payload: unknown): string | undefined {
  if (typeof payload === "string") {
    return truncate(payload, HTTP_ERROR_TEXT_LIMIT);
  }

  if (!isJsonObject(payload)) {
    return undefined;
  }

  return (
    readNestedString(payload, ["details", "reason"]) ??
    readNestedString(payload, ["reason"]) ??
    readNestedString(payload, ["message"]) ??
    readNestedString(payload, ["error_description"]) ??
    readNestedString(payload, ["error"])
  );
}

function formatHttpErrorReason(
  response: HttpStatusLike,
  fallbackReason: string,
): string {
  if (response.statusText) {
    return `${fallbackReason} HTTP ${response.status}: ${response.statusText}`;
  }

  return `${fallbackReason} HTTP ${response.status}.`;
}

function isJsonContainer(value: unknown): value is JsonObject | JsonValue[] {
  return Array.isArray(value) || isJsonObject(value);
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function newHttpError(options: HttpErrorOptions, cause?: unknown): RichError {
  return newRichError({
    cause,
    code: options.code,
    details: {
      action: options.action,
      reason: options.reason,
    },
    isOperational: true,
    kind: options.kind ?? "Internal",
    layer: options.layer ?? "External",
  });
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

function remapFetchErrorLayer(
  error: RichError,
  layer: RichError["layer"] | undefined,
): RichError {
  if (!layer || layer === error.layer) {
    return error;
  }

  return newRichError({
    cause: error.cause,
    code: error.code,
    details: error.details,
    i18n: error.i18n,
    isOperational: error.isOperational,
    kind: error.kind,
    layer,
    meta: error.meta as NewRichError["meta"],
  });
}
