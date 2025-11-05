import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from "express";
import type { Hono } from "hono";

/**
 * Express-compatible adapter for a Hono app.
 *
 * Provides a plain Express-style handler `(req, res) => Promise<void>` so that
 * delivery layers (e.g. Firebase Functions via `onRequest`) can bind the
 * runtime without this module importing those runtimes directly.
 */
export function createExpressRequestHandler(app: Hono) {
  return async (req: ExpressRequest, res: ExpressResponse) => {
    const url = new URL(`${req.protocol}://${req.hostname}${req.url}`);

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

    const _res = await app.fetch(newRequest);

    res.status(_res.status);

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

    const contentType = _res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      res.json(await _res.json());
    } else {
      res.send(await _res.text());
    }
  };
}
