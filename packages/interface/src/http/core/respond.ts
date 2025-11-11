import type { Context } from "hono";
import type { ResultAsync } from "neverthrow";

import { newZodError, toHttpErrorResponse } from "@o3osatoshi/toolkit";

/**
 * Railway-style responder: map a `ResultAsync` into a JSON HTTP response.
 *
 * - Success → returns a 200 JSON response with the value.
 * - Failure → converts the error via {@link toHttpErrorResponse} and returns
 *   a normalized JSON error with an appropriate status code.
 *
 * @returns A function that accepts a `ResultAsync<T, Error>` and yields a
 * `Promise<Response>` suitable for Hono route handlers.
 */
export function respond<T>(c: Context) {
  return (ra: ResultAsync<T, Error>) =>
    ra.match(
      (ok) => c.json<T>(ok),
      (err) => {
        const { body, status } = toHttpErrorResponse(err);
        return c.json(body, { status });
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
    const { body, status } = toHttpErrorResponse(
      newZodError({ cause: result.error }),
    );
    return c.json(body, { status });
  }
  return undefined;
}
