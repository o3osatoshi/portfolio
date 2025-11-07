import type { Context } from "hono";
import type { ResultAsync } from "neverthrow";

import { toHttpErrorResponse } from "@o3osatoshi/toolkit";

/**
 * Railway-style responder: map ResultAsync to a JSON response.
 *
 * Success → 200 JSON by default. Failure → normalized error JSON with mapped status.
 */
export function respond<T>(c: Context) {
  return (ra: ResultAsync<T, Error>) =>
    ra.match(
      (ok) => c.json(ok),
      (err) => {
        const { body, status } = toHttpErrorResponse(err);
        return c.json(body, { status });
      },
    );
}
