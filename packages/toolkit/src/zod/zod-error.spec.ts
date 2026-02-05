import { describe, expect, it } from "vitest";
import { z } from "zod";

import { isRichError } from "../error";
import {
  isZodError,
  newZodError,
  summarizeZodError,
  summarizeZodIssue,
} from "./zod-error";
import { parseWith } from "./zod-parse";

function parseZodError<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): z.ZodError {
  const parse = parseWith(schema, { action: "TestParse" });
  const result = parse(input);
  if (result.isOk()) throw new Error("Expected failure");
  const cause = (result.error as { cause?: unknown }).cause;
  if (!(cause instanceof z.ZodError)) {
    throw new Error("Expected ZodError");
  }
  return cause;
}

describe("zod-error helpers (with real Zod)", () => {
  it("isZodError identifies actual ZodError", () => {
    const schema = z.object({ name: z.string() });
    const err = parseZodError(schema, { name: 123 });
    expect(isZodError(err)).toBe(true);
    expect(isZodError(new Error("Hello, zod!"))).toBe(false);
  });

  it("isZodError recognizes duck-typed ZodError shape (cross-instance)", () => {
    // Simulate a ZodError-like object coming from a different Zod instance
    const fake = {
      name: "ZodError",
      issues: [
        {
          code: "invalid_type",
          expected: "string",
          message: "Expected string, received number",
          path: [],
          received: "number",
        },
      ],
    } as unknown;

    expect(isZodError(fake)).toBe(true);

    const almost = { name: "ZodError" } as unknown;
    expect(isZodError(almost)).toBe(false);
  });

  it("summarizeZodIssue handles invalid_type and invalid_enum_value", () => {
    const schema1 = z.string();
    const err1 = parseZodError(schema1, 42);
    const issue1 = err1.issues[0];
    if (issue1 === undefined) throw new Error("Expected an issue");
    const s1 = summarizeZodIssue(issue1);
    expect(s1).toContain("(root): Expected string, received number");

    const schema2 = z.object({ type: z.enum(["BUY", "SELL"]) });
    const err2 = parseZodError(schema2, { type: "HOGE" });
    const issue2 = err2.issues[0];
    if (issue2 === undefined) throw new Error("Expected an issue");
    const s2 = summarizeZodIssue(issue2);
    expect(s2).toContain(
      "type: Invalid enum value, expected one of: BUY, SELL",
    );
  });

  it("summarizeZodError joins multiple issues with semicolons", () => {
    const schema = z.object({ a: z.string().min(3), b: z.number().max(5) });
    const err = parseZodError(schema, { a: "", b: 10 });
    const s = summarizeZodError(err);
    expect(s).toContain("a: Too small string: min 3 (inclusive)");
    expect(s).toContain("b: Too big number: max 5");
    expect(s.split("; ").length).toBeGreaterThanOrEqual(2);
  });

  it("newZodError builds ApplicationValidationError with inferred hint", () => {
    const schema = z.object({ name: z.string() });
    const err = newZodError({
      cause: parseZodError(schema, { name: 123 }),
      details: { action: "ParseUser" },
    });
    expect(err.name).toBe("ApplicationValidationError");
    const message = err.message;
    expect(message).toContain(
      "ParseUser failed: name: Expected string, received number",
    );
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.hint).toBe("Check field types match the schema.");
    }
  });

  it("newZodError supports custom layer and issues without cause (unrecognized_keys)", () => {
    const strictSchema = z.object({ a: z.string() }).strict();
    const errCause = parseZodError(strictSchema, { a: "x", extra: 1 });
    const err = newZodError({
      details: { action: "ValidateForm" },
      issues: errCause.issues,
      layer: "UI",
    });
    expect(err.name).toBe("UIValidationError");
    const message = err.message;
    expect(message).toContain("ValidateForm failed:");
    expect(message).toContain("Unrecognized keys:");
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.hint).toBe("Remove unknown fields from the payload.");
    }
  });

  it("newZodError falls back to generic reason when no issues", () => {
    const err = newZodError({
      cause: { message: "x" },
      details: { action: "Parse" },
    });
    expect(err.name).toBe("ApplicationValidationError");
    expect(err.message).toContain("Parse failed: Invalid request payload");
  });

  it("covers more codes: too_big, invalid_string(email), not_multiple_of, invalid_date, union", () => {
    const schema = z.object({
      email: z.string().email(),
      k: z.number().multipleOf(5),
      n: z.number().max(5),
      u: z.union([z.string(), z.number()]),
      when: z.date(),
    });
    const err = parseZodError(schema, {
      email: "a",
      k: 3,
      n: 10,
      u: {},
      when: new Date(Number.NaN),
    });
    const summary = summarizeZodError(err);
    expect(summary).toContain("n: Too big number: max 5");
    expect(summary).toContain("email: Invalid string (email)");
    expect(summary).toContain("k: Not a multiple of 5");
    expect(summary).toContain("when: Invalid date");
    expect(summary).toContain("u: Invalid value for union type");
  });

  it("handles invalid_union_discriminator (v4) without listing options", () => {
    const schema = z.discriminatedUnion("type", [
      z.object({ a: z.string(), type: z.literal("a") }),
      z.object({ b: z.number(), type: z.literal("b") }),
    ]);
    const err = parseZodError(schema, { type: "c" });
    const summary = summarizeZodError(err);
    expect(summary).toContain("Invalid discriminator value");
  });

  it("invalid_union_discriminator with unionFallback includes expected options", () => {
    const schema = z.discriminatedUnion(
      "type",
      [
        z.object({ a: z.string(), type: z.literal("a") }),
        z.object({ b: z.number(), type: z.literal("b") }),
      ],
      { unionFallback: true },
    );
    const err = parseZodError(schema, { type: "c" });
    const summary = summarizeZodError(err);
    expect(summary).toContain("Invalid discriminator value");
    expect(summary).toContain("expected one of: a, b");
  });
});
