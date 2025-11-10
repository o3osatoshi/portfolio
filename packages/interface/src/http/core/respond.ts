import type { Context } from "hono";
import type { ResultAsync } from "neverthrow";

import { newZodError, toHttpErrorResponse } from "@o3osatoshi/toolkit";

/**
 * Railway-style responder: map ResultAsync to a JSON response.
 *
 * Success → 200 JSON by default. Failure → normalized error JSON with mapped status.
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

export function respondZodError(result, c) {
  if (!result.success) {
    const { body, status } = toHttpErrorResponse(
      newZodError({ cause: result.error }),
    );
    return c.json(body, { status });
  }
}
