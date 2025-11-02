import { describe, expect, it } from "vitest";

import {
  ForbiddenError,
  NotFoundError,
  toHttpError,
  UnauthorizedError,
  ValidationError,
} from "./errors";

describe("errors/toHttpError", () => {
  it("maps known errors to status/body", () => {
    expect(toHttpError(new ValidationError("v"))).toEqual({
      body: { code: "VALIDATION_ERROR", message: "v" },
      status: 400,
    });
    expect(toHttpError(new UnauthorizedError("u"))).toEqual({
      body: { code: "UNAUTHORIZED", message: "u" },
      status: 401,
    });
    expect(toHttpError(new ForbiddenError("f"))).toEqual({
      body: { code: "FORBIDDEN", message: "f" },
      status: 403,
    });
    expect(toHttpError(new NotFoundError("n"))).toEqual({
      body: { code: "NOT_FOUND", message: "n" },
      status: 404,
    });
  });

  it("maps unknown errors to 500 with message", () => {
    expect(toHttpError(new Error("boom"))).toEqual({
      body: { code: "INTERNAL_SERVER_ERROR", message: "boom" },
      status: 500,
    });
    expect(toHttpError("oops")).toEqual({
      body: { code: "INTERNAL_SERVER_ERROR", message: "Internal Server Error" },
      status: 500,
    });
  });
});
