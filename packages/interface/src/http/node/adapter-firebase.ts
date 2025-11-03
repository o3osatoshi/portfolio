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
  return onRequest({ invoker: "public" }, async (req, res) => {
    // Firebase often provides a relative `req.url`. Build an absolute URL using headers.
    const headersObj = req.headers as Record<
      string,
      string | string[] | undefined
    >;
    const proto = (headersObj["x-forwarded-proto"] as string) || "https";
    const host =
      (headersObj["x-forwarded-host"] as string) ||
      (headersObj["host"] as string) ||
      "localhost";
    const base = `${proto}://${host}`;
    // Prefer `req.url` (path relative to the function) to avoid double-prefixing the function name.
    const path =
      (req as { originalUrl?: string; url?: string }).url ||
      (req as { originalUrl?: string }).originalUrl ||
      "/";
    const url = new URL(path, base);

    // Normalize headers into the Fetch API `Headers`.
    const headers = new Headers();
    for (const [k, v] of Object.entries(headersObj)) {
      if (Array.isArray(v)) headers.set(k, v.join(", "));
      else if (typeof v === "string") headers.set(k, v);
    }

    // Prefer rawBody if present to avoid body parsing issues in Firebase.
    const rb =
      (req as { body?: unknown; rawBody?: unknown }).rawBody ??
      (req as { body?: unknown }).body;
    const init: RequestInit = { headers, method: req.method };
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (typeof rb === "string") init.body = rb;
      else if (rb instanceof Uint8Array) init.body = rb;
      else if (rb instanceof ArrayBuffer) init.body = rb;
      else if (rb && typeof rb === "object") {
        try {
          init.body = JSON.stringify(rb);
          if (!headers.has("content-type"))
            headers.set("content-type", "application/json");
        } catch {
          // noop: if serialization fails, leave body undefined
        }
      }
    }

    const request = new Request(url.toString(), init);
    const honoRes = await app.fetch(request);

    // Write back status, headers, and body to Firebase response.
    honoRes.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    const buf = Buffer.from(await honoRes.arrayBuffer());
    res.status(honoRes.status).send(buf);
  });
}
