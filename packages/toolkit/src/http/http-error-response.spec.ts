import { describe, expect, it } from "vitest";

import { newRichError, serializeError } from "../error";
import { toHttpErrorResponse } from "./http-error-response";

describe("toHttpErrorResponse", () => {
  it("uses provided status when specified", () => {
    const err = newRichError({ kind: "Validation", layer: "Application" });
    const res = toHttpErrorResponse(err, 405);
    expect(res.statusCode).toBe(405);
    expect(res.body).toEqual(serializeError(err));
  });

  it("infers status from error kind in name", () => {
    const cases = [
      { kind: "Validation", layer: "Application", status: 400 },
      { kind: "NotFound", layer: "Application", status: 404 },
      { kind: "Forbidden", layer: "Auth", status: 403 },
      { kind: "Unauthorized", layer: "Auth", status: 401 },
      { kind: "BadRequest", layer: "Application", status: 400 },
      { kind: "Conflict", layer: "Domain", status: 409 },
      { kind: "RateLimit", layer: "External", status: 429 },
      { kind: "MethodNotAllowed", layer: "Application", status: 405 },
      { kind: "Timeout", layer: "Infra", status: 504 },
      { kind: "Unavailable", layer: "Infra", status: 503 },
      { kind: "Unprocessable", layer: "Application", status: 422 },
      { kind: "BadGateway", layer: "Infra", status: 502 },
    ] as const;

    for (const { kind, layer, status } of cases) {
      const err = newRichError({ kind, layer });
      const res = toHttpErrorResponse(err);
      expect(res.statusCode).toBe(status);
    }
  });

  it("maps canceled to 408 (client closed request)", () => {
    const canceled = newRichError({ kind: "Canceled", layer: "Infra" });
    const res = toHttpErrorResponse(canceled);
    expect(res.statusCode).toBe(408);
  });

  it("defaults to 500 for unknown names", () => {
    const e = new Error("boom");
    e.name = "TotallyCustomName";
    const res = toHttpErrorResponse(e);
    expect(res.statusCode).toBe(500);
  });

  it("treats ZodError as validation (400)", () => {
    const e = new Error("invalid");
    e.name = "ZodError";
    const res = toHttpErrorResponse(e);
    expect(res.statusCode).toBe(400);
  });

  it("includes serialized cause and respects includeStack option", () => {
    const cause = new Error("inner");
    const top = new Error("top", { cause });
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
