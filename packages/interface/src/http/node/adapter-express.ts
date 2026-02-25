import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import type { Env, Hono, Schema } from "hono";

/**
 * Express-compatible adapter for a Hono app.
 *
 * Provides a plain Express-style handler `(req, res) => Promise<void>` so that
 * delivery layers (e.g. Firebase Functions via `onRequest`) can bind the
 * runtime without this module importing those runtimes directly.
 *
 * Flow overview:
 * 1) Build an absolute URL from Express request parts.
 * 2) Copy inbound headers from Express into a Fetch `Headers`.
 * 3) Create a Fetch `Request`, marshaling the body for non-GET/HEAD methods.
 * 4) Delegate to the Hono app via `app.fetch(Request)`.
 * 5) Write the returned status code to Express `res`.
 * 6) Forward all response headers (preserving duplicates like `set-cookie`),
 *    skipping `content-length` to avoid mismatches after re-serialization.
 * 7) Send the response body as JSON or text based on `content-type`.
 *
 * @param app Hono app instance.
 * @returns Express-compatible request handler `(req, res) => Promise<void>`.
 * @public
 */
export function createExpressRequestHandler<
  E extends Env,
  S extends Schema,
  BasePath extends string,
>(app: Hono<E, S, BasePath>) {
  return async (req: ExpressRequest, res: ExpressResponse) => {
    // 1) Build absolute URL from Express request parts
    const url = new URL(`${req.protocol}://${req.hostname}${req.url}`);

    // 2) Collect inbound headers from Express into a Fetch Headers instance
    const headers = new Headers();
    Object.keys(req.headers).forEach((k) => {
      const v = req.headers[k];
      if (Array.isArray(v)) {
        for (const value of v) {
          headers.append(k, value);
        }
      } else if (typeof v === "string") {
        headers.set(k, v);
      }
    });

    const body = req.body;

    // 3) Construct a Fetch Request, marshaling the body when needed
    const newRequest = ["GET", "HEAD"].includes(req.method)
      ? new Request(url, {
          headers,
          method: req.method,
        })
      : new Request(url, {
          body:
            typeof body === "string"
              ? Buffer.from(body)
              : body instanceof Uint8Array
                ? Buffer.from(body)
                : body instanceof ArrayBuffer
                  ? Buffer.from(new Uint8Array(body))
                  : Buffer.from(JSON.stringify(body || {})),
          headers,
          method: req.method,
        });

    // 4) Delegate request handling to the Hono app
    const _res = await app.fetch(newRequest);

    // 5) Propagate status code to Express response
    res.status(_res.status);

    // 6) Forward all response headers while preserving duplicates.
    //    We intentionally skip `content-length` to avoid mismatches with the
    //    serialized body that Express sends.
    const aggregated = new Map<string, string[]>();
    _res.headers.forEach((value, key) => {
      const k = key.toLowerCase();
      if (k === "content-length") return;
      const list = aggregated.get(k) ?? [];
      list.push(value);
      aggregated.set(k, list);
    });
    for (const [key, values] of aggregated) {
      // biome-ignore lint/style/noNonNullAssertion: The preceding logic guarantees the array has at least one element.
      res.setHeader(key, values.length > 1 ? values : values[0]!);
    }

    // 7) Send response body based on returned content type
    const contentType = _res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      res.json(await _res.json());
    } else {
      res.send(await _res.text());
    }
  };
}
