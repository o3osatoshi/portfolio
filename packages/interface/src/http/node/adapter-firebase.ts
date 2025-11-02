import { onRequest } from "firebase-functions/v2/https";
import type { Hono } from "hono";

/**
 * Create a Firebase HTTPS function handler that bridges a Hono app.
 *
 * The adapter translates the Firebase `req`/`res` objects to a Web
 * `Request` for `app.fetch`, then writes the Hono `Response` back to
 * Firebase’s `res` with headers, status, and body.
 *
 * Note: Firebase provides a non-standard `rawBody` on the request. It is
 * passed through verbatim if present to preserve the original payload.
 *
 * @param app Hono application to handle incoming requests.
 * @returns A Firebase `onRequest` handler.
 */
export function createFirebaseHandler(app: Hono) {
  return onRequest(async (req, res) => {
    const url = new URL(req.url);
    const rb = (req as { rawBody?: unknown }).rawBody;

    const headers = new Headers();
    const srcHeaders = req.headers as Record<
      string,
      string | string[] | undefined
    >;
    for (const [k, v] of Object.entries(srcHeaders)) {
      if (Array.isArray(v)) headers.set(k, v.join(", "));
      else if (typeof v === "string") headers.set(k, v);
    }

    const init: RequestInit = { headers, method: req.method };
    if (typeof rb === "string") init.body = rb;
    else if (rb instanceof Uint8Array) init.body = rb;
    else if (rb instanceof ArrayBuffer) init.body = rb;
    const request = new Request(url.toString(), init);

    const honoRes = await app.fetch(request);
    honoRes.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const buf = Buffer.from(await honoRes.arrayBuffer());
    res.status(honoRes.status).send(buf);
  });
}
