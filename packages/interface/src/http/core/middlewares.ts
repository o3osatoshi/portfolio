import type { Context, Next } from "hono";

/**
 * Minimal request logger middleware.
 * Logs: HTTP method, path, response status, and elapsed time in ms.
 *
 * @param c Hono context for the current request.
 * @param next Function to invoke the downstream handler/middleware.
 */
export async function loggerMiddleware(c: Context, next: Next) {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;

  console.log(`${c.req.method} ${c.req.path} -> ${c.res.status} (${ms}ms)`);
}

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
