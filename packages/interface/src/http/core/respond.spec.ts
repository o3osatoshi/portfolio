import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { err, errAsync, ok, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";
import { z } from "zod";

import { newError } from "@o3osatoshi/toolkit";

import { respond, respondAsync, respondZodError } from "./respond";

describe("http/core/respond", () => {
  describe("respond (sync Result)", () => {
    it("maps ok Result to 200 JSON", async () => {
      const app = new Hono();
      app.get("/t", (c) => respond<{ ok: boolean }>(c)(ok({ ok: true })));

      const res = await app.request("/t");
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });

    it("maps error Result to status derived from error kind", async () => {
      const app = new Hono();
      app.get("/e", (c) =>
        respond<never>(c)(
          err(
            newError({
              action: "LookupEntity",
              kind: "NotFound",
              layer: "Domain",
              reason: "Entity missing",
            }),
          ),
        ),
      );

      const res = await app.request("/e");
      expect(res.status).toBe(404);
      const body = await res.json();
      // Basic shape from serializeError
      expect(body).toHaveProperty("name", "DomainNotFoundError");
      expect(typeof body.message).toBe("string");
    });

    it("maps AbortError to 408 Canceled", async () => {
      const app = new Hono();
      app.get("/aborted", (c) =>
        respond<never>(c)(
          err(
            (() => {
              const e = new Error("aborted");
              // Simulate a DOM-style AbortError without depending on DOMException
              e.name = "AbortError";
              return e;
            })(),
          ),
        ),
      );

      const res = await app.request("/aborted");
      expect(res.status).toBe(408);
      const body = await res.json();
      expect(typeof body.message).toBe("string");
    });

    it("defaults unknown errors to 500", async () => {
      const app = new Hono();
      app.get("/unknown", (c) => respond<never>(c)(err(new Error("boom"))));
      const res = await app.request("/unknown");
      expect(res.status).toBe(500);
    });
  });

  describe("respondAsync (ResultAsync)", () => {
    it("maps ok ResultAsync to 200 JSON", async () => {
      const app = new Hono();
      app.get("/t", (c) =>
        respondAsync<{ ok: boolean }>(c)(okAsync({ ok: true })),
      );

      const res = await app.request("/t");
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });

    it("maps error ResultAsync to status derived from error kind", async () => {
      const app = new Hono();
      app.get("/e", (c) =>
        respondAsync<never>(c)(
          errAsync(
            newError({
              action: "LookupEntity",
              kind: "NotFound",
              layer: "Domain",
              reason: "Entity missing",
            }),
          ),
        ),
      );

      const res = await app.request("/e");
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body).toHaveProperty("name", "DomainNotFoundError");
      expect(typeof body.message).toBe("string");
    });

    it("maps AbortError in ResultAsync to 408 Canceled", async () => {
      const app = new Hono();
      app.get("/aborted", (c) =>
        respondAsync<never>(c)(
          errAsync(
            (() => {
              const e = new Error("aborted");
              e.name = "AbortError";
              return e;
            })(),
          ),
        ),
      );

      const res = await app.request("/aborted");
      expect(res.status).toBe(408);
      const body = await res.json();
      expect(typeof body.message).toBe("string");
    });

    it("defaults unknown errors in ResultAsync to 500", async () => {
      const app = new Hono();
      app.get("/unknown", (c) =>
        respondAsync<never>(c)(errAsync(new Error("boom"))),
      );
      const res = await app.request("/unknown");
      expect(res.status).toBe(500);
    });
  });

  describe("respondZodError (zValidator hook)", () => {
    it("responds with 400 and serialized error when zValidator fails", async () => {
      const app = new Hono();
      const schema = z.object({ q: z.string().min(2) });
      app.get("/q", zValidator("query", schema, respondZodError), (c) =>
        c.json({ ok: true }),
      );

      const res = await app.request("/q?q=a");
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body).toHaveProperty("name", "ApplicationValidationError");
      expect(typeof body.message).toBe("string");
    });

    it("is a no-op when zValidator succeeds", async () => {
      const app = new Hono();
      const schema = z.object({ q: z.string().min(2) });
      app.get("/q2", zValidator("query", schema, respondZodError), (c) =>
        c.json({ ok: true }),
      );

      const res = await app.request("/q2?q=ok");
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ ok: true });
    });
  });
});
