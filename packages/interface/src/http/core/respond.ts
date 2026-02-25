import type { Context } from "hono";
import type { Result, ResultAsync } from "neverthrow";

import {
  type ErrorStatusCode,
  newZodError,
  type RichError,
  type SerializedError,
  toHttpErrorResponse,
} from "@o3osatoshi/toolkit";

/**
 * JSON success status codes accepted by responder helpers.
 * @public
 */
export type SuccessStatusCode = 200 | 201 | 202 | 203 | 206 | 207 | 208 | 226;

/**
 * Build a responder for sync `Result` flow.
 *
 * Success:
 * - serialized as JSON with an HTTP status in `SuccessStatusCode`
 *
 * Failure:
 * - stored into context key `error`
 * - converted with `toHttpErrorResponse` to status/body
 *
 * @param c Hono context.
 * @returns JSON response.
 * @public
 */
export function respond<T>(c: Context) {
  return (ra: Result<T, RichError>) =>
    ra.match(
      (ok) => c.json<T, SuccessStatusCode>(ok),
      (err) => {
        c.set("error", err);
        const { body, statusCode } = toHttpErrorResponse(err);
        return c.json<SerializedError, ErrorStatusCode>(body, {
          status: statusCode,
        });
      },
    );
}

/**
 * Railway-style responder: map a `ResultAsync` into a JSON HTTP response.
 *
 * - Success → returns a 200 JSON response with the value.
 * - Failure → converts the error via `toHttpErrorResponse` (from
 *   `@o3osatoshi/toolkit`) and returns a normalized JSON error with an
 *   appropriate status code.
 *
 * @param c Hono context.
 * @returns A function that accepts `ResultAsync<T, RichError>`.
 * @public
 */
export function respondAsync<T>(c: Context) {
  return (ra: ResultAsync<T, RichError>) =>
    ra.match(
      (ok) => c.json<T, SuccessStatusCode>(ok),
      (err) => {
        c.set("error", err);
        const { body, statusCode } = toHttpErrorResponse(err);
        return c.json<SerializedError, ErrorStatusCode>(body, {
          status: statusCode,
        });
      },
    );
}

/**
 * zValidator hook that maps Zod validation failures to normalized JSON errors.
 *
 * Usage with Hono + @hono/zod-validator:
 * - Provide this as the 3rd argument to `zValidator`.
 * - On `result.success === false` it returns a JSON response built from
 *   `toHttpErrorResponse(newZodError({ cause: result.error }))`.
 * - When validation succeeds, it returns `undefined` to continue the pipeline.
 *
 * @example
 * app.get(
 *   "/route",
 *   zValidator("query", schema, respondZodError),
 *   (c) => c.json({ ok: true }),
 * );
 *
 * @param result - Result passed by `zValidator` containing success flag and optional ZodError.
 * @param c - Hono context used to create the JSON response.
 * @returns A JSON `Response` when validation fails, otherwise `undefined` to
 * allow request processing to continue.
 * @public
 */
export function respondZodError(
  result: {
    error?: unknown;
    success: boolean;
  },
  c: Context,
): Response | undefined {
  if (!result.success) {
    const err = newZodError({ cause: result.error });
    c.set("error", err);
    const { body, statusCode } = toHttpErrorResponse(err);
    return c.json(body, { status: statusCode });
  }
  return undefined;
}
