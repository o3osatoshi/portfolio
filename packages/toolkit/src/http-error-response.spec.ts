import { describe, expect, it } from "vitest";

import { newError } from "./error";
import { deserializeError, serializeError } from "./error-serializer";
import { toHttpErrorResponse } from "./http-error-response";

describe("toHttpErrorResponse", () => {
  it("uses provided status when specified", () => {
    const err = newError({ kind: "Validation", layer: "Application" });
    const res = toHttpErrorResponse(err, 418);
    expect(res.status).toBe(418);
    expect(res.body).toEqual(serializeError(err));
  });

  it("infers status from error kind in name", () => {
    const notFound = newError({ kind: "NotFound", layer: "Application" });
    const r1 = toHttpErrorResponse(notFound);
    expect(r1.status).toBe(404);

    const forbidden = newError({ kind: "Forbidden", layer: "Auth" });
    const r2 = toHttpErrorResponse(forbidden);
    expect(r2.status).toBe(403);

    const conflict = newError({ kind: "Conflict", layer: "Domain" });
    const r3 = toHttpErrorResponse(conflict);
    expect(r3.status).toBe(409);

    const rateLimit = newError({ kind: "RateLimit", layer: "External" });
    const r4 = toHttpErrorResponse(rateLimit);
    expect(r4.status).toBe(429);

    const timeout = newError({ kind: "Timeout", layer: "Infra" });
    const r5 = toHttpErrorResponse(timeout);
    expect(r5.status).toBe(504);

    const unavailable = newError({ kind: "Unavailable", layer: "Infra" });
    const r6 = toHttpErrorResponse(unavailable);
    expect(r6.status).toBe(503);
  });

  it("maps canceled to 499 (client closed request)", () => {
    const canceled = newError({ kind: "Canceled", layer: "Infra" });
    const res = toHttpErrorResponse(canceled);
    expect(res.status).toBe(499);
  });

  it("defaults to 500 for unknown names", () => {
    const e = new Error("boom");
    e.name = "TotallyCustomName";
    const res = toHttpErrorResponse(e);
    expect(res.status).toBe(500);
  });

  it("treats ZodError as validation (400)", () => {
    const payload = { name: "ZodError", message: "invalid" };
    const e = deserializeError(payload);
    const res = toHttpErrorResponse(e);
    expect(res.status).toBe(400);
  });

  it("includes serialized cause and respects includeStack option", () => {
    const cause = new Error("inner");
    const top = new (Error as any)("top", { cause });
    const withStack = toHttpErrorResponse(top, undefined, {
      includeStack: true,
    });
    const withoutStack = toHttpErrorResponse(top, undefined, {
      includeStack: false,
    });

    expect(
      withStack.body.stack && typeof withStack.body.stack === "string",
    ).toBe(true);
    expect(withoutStack.body.stack).toBeUndefined();
    expect(withStack.body.cause || withoutStack.body.cause).toBeDefined();
  });
});
