import { Hono } from "hono";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

import { newError } from "@o3osatoshi/toolkit";

import { respond } from "./respond";

describe("http/core/respond", () => {
  it("maps ok ResultAsync to 200 JSON", async () => {
    const app = new Hono();
    app.get("/t", (c) => respond<{ ok: boolean }>(c)(okAsync({ ok: true })));

    const res = await app.request("/t");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("maps error ResultAsync to status derived from error kind", async () => {
    const app = new Hono();
    app.get("/e", (c) =>
      respond<never>(c)(
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
    // Basic shape from serializeError
    expect(body).toHaveProperty("name", "DomainNotFoundError");
    // @ts-expect-error
    expect(typeof body.message).toBe("string");
  });
});
