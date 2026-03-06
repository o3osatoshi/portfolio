import { describe, expect, it } from "vitest";
import { z } from "zod";

import { newRichError } from "../error";
import { parseWith } from "./zod-parse";

describe("zod-parse: parseWith", () => {
  it("returns ok for valid input", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const parse = parseWith(schema, { action: "ParseUser" });
    const res = parse({ name: "alice", age: 42 });
    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value).toEqual({ name: "alice", age: 42 });
    }
  });

  it("returns err with ApplicationValidationError by default", () => {
    const schema = z.object({ name: z.string(), age: z.number() });
    const parse = parseWith(schema, { action: "ParseUser" });
    const res = parse({ name: 123, age: "x" });
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("ApplicationValidationError");
      const message = res.error.message;
      expect(message).toContain("ParseUser failed");
      expect(message).toContain("name:");
      expect(message).toContain("age:");
      expect(message.toLowerCase()).toContain("expected string");
      expect(message.toLowerCase()).toContain("expected number");
    }
  });

  it("respects custom layer in error name", () => {
    const schema = z.object({ email: z.string().email() });
    const parse = parseWith(schema, {
      action: "ParseForm",
      layer: "Presentation",
    });
    const res = parse({ email: "invalid" });
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("PresentationValidationError");
      const message = res.error.message;
      expect(message).toContain("ParseForm failed");
      expect(message).toContain("email:");
      expect(message.toLowerCase()).toContain("invalid");
    }
  });

  it("allows overriding error code", () => {
    const schema = z.object({ name: z.string() });
    const parse = parseWith(schema, {
      action: "ParseUser",
      code: "CLI_COMMAND_INVALID_ARGUMENT",
    });
    const res = parse({ name: 123 });

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
    }
  });

  it("can include normalized validation issues into error meta", () => {
    const schema = z.object({ name: z.string() });
    const parse = parseWith(schema, {
      includeValidationIssues: true,
      action: "ParseUser",
    });
    const res = parse({ name: 123 });

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.meta).toEqual({
        validationIssues: [
          {
            code: "invalid_type",
            message: "Invalid input: expected string, received number",
            path: "name",
          },
        ],
      });
    }
  });

  it("applies mapError transform when provided", () => {
    const schema = z.object({ name: z.string() });
    const parse = parseWith(schema, {
      action: "ParseUser",
      mapError: (error) =>
        newRichError({
          cause: error.cause,
          code: "PARSE_USER_FAILED",
          details: {
            ...error.details,
            reason: "Custom parse failure",
          },
          isOperational: error.isOperational,
          kind: error.kind,
          layer: error.layer,
          meta: error.meta,
        }),
    });
    const res = parse({ name: 123 });

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe("PARSE_USER_FAILED");
      expect(res.error.details?.reason).toBe("Custom parse failure");
    }
  });

  it("falls back to base error if mapError throws", () => {
    const schema = z.object({ name: z.string() });
    const parse = parseWith(schema, {
      action: "ParseUser",
      code: "CUSTOM_CODE",
      mapError: () => {
        throw new Error("map failed");
      },
    });
    const res = parse({ name: 123 });

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe("CUSTOM_CODE");
      expect(res.error.name).toBe("ApplicationValidationError");
    }
  });
});
