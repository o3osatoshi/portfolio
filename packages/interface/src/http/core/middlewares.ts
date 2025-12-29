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
 */
export async function requestIdMiddleware(c: Context, next: Next) {
  const rid = c.req.header("x-request-id") ?? crypto.randomUUID?.() ?? "";
  c.res.headers.set("x-request-id", rid);
  c.set("requestId", rid);
  await next();
}

export const userIdMiddleware: MiddlewareHandler<ContextEnv> = async (
  c,
  next,
) => {
  c.get("requestLogger")?.setUserId?.(getAuthUserId(c.get("authUser")));
  await next();
};
