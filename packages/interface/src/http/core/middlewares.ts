import { getAuthUserId } from "@repo/auth";
import type { Context, MiddlewareHandler, Next } from "hono";

import type { ContextEnv } from "./types";

/**
 * Simple request id middleware.
 *
 * - Uses an incoming `x-request-id` header when present.
 * - Otherwise generates a UUID (when available) and sets it on the response.
 * - Also stores the id in the context under the `requestId` key.
 *
 * @param c Hono context for the current request.
 * @param next Function to invoke the downstream handler/middleware.
 * @returns Resolves after downstream middleware completes.
 * @public
 */
export async function requestIdMiddleware(
  c: Context,
  next: Next,
): Promise<void> {
  const rid = c.req.header("x-request-id") ?? crypto.randomUUID?.() ?? "";
  c.res.headers.set("x-request-id", rid);
  c.set("requestId", rid);
  await next();
}

/**
 * Inject request user id into the active request logger.
 *
 * Uses `authUser` from context and sets `userId` on `requestLogger` when both
 * are present.
 *
 * @remarks This middleware should run after auth initialization middleware so that
 * `authUser` is available.
 * @param c Hono context.
 * @param next Next middleware.
 * @public
 */
export const userIdMiddleware: MiddlewareHandler<ContextEnv> = async (
  c,
  next,
) => {
  c.get("requestLogger")?.setUserId?.(getAuthUserId(c.get("authUser")));
  await next();
};
