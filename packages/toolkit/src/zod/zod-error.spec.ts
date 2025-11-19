import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  isZodError,
  newZodError,
  summarizeZodError,
  summarizeZodIssue,
} from "./zod-error";

describe("zod-error helpers (with real Zod)", () => {
  it("isZodError identifies actual ZodError", () => {
    const schema = z.object({ name: z.string() });
    const res = schema.safeParse({ name: 123 });
    expect(res.success).toBe(false);
    expect(isZodError(res.error)).toBe(true);
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
    const res1 = schema1.safeParse(42);
    if (res1.success) throw new Error("Expected failure");
    const issue1 = res1.error.issues[0];
    if (issue1 === undefined) throw new Error("Expected an issue");
    const s1 = summarizeZodIssue(issue1);
    expect(s1).toContain("(root): Expected string, received number");

    const schema2 = z.object({ type: z.enum(["BUY", "SELL"]) });
    const res2 = schema2.safeParse({ type: "HOGE" });
    if (res2.success) throw new Error("Expected failure");
    const issue2 = res2.error.issues[0];
    if (issue2 === undefined) throw new Error("Expected an issue");
    const s2 = summarizeZodIssue(issue2);
    expect(s2).toContain(
      "type: Invalid enum value, expected one of: BUY, SELL",
    );
  });

  it("summarizeZodError joins multiple issues with semicolons", () => {
    const schema = z.object({ a: z.string().min(3), b: z.number().max(5) });
    const res = schema.safeParse({ a: "", b: 10 });
    if (!isZodError(res.error)) throw new Error("Expected ZodError");
    const s = summarizeZodError(res.error);
    expect(s).toContain("a: Too small string: min 3 (inclusive)");
    expect(s).toContain("b: Too big number: max 5");
    expect(s.split("; ").length).toBeGreaterThanOrEqual(2);
  });

  it("newZodError builds ApplicationValidationError with inferred hint", () => {
    const schema = z.object({ name: z.string() });
    const res = schema.safeParse({ name: 123 });
    if (res.success) throw new Error("Expected failure");
    const err = newZodError({ action: "ParseUser", cause: res.error });
    expect(err.name).toBe("ApplicationValidationError");
    const message = err.message;
    expect(message).toContain("ParseUser failed");
    expect(message).toContain("name: Expected string, received number");
    expect(message).toContain("Check field types match the schema.");
  });

  it("newZodError supports custom layer and issues without cause (unrecognized_keys)", () => {
    const strictSchema = z.object({ a: z.string() }).strict();
    const res = strictSchema.safeParse({ a: "x", extra: 1 });
    if (res.success) throw new Error("Expected failure");
    const err = newZodError({
      action: "ValidateForm",
      issues: res.error.issues,
      layer: "UI",
    });
    expect(err.name).toBe("UIValidationError");
    const message = err.message;
    expect(message).toContain("ValidateForm failed");
    expect(message).toContain("Unrecognized keys:");
    expect(message).toContain("Remove unknown fields from the payload.");
  });

  it("newZodError falls back to generic reason when no issues", () => {
    const err = newZodError({ action: "Parse", cause: { message: "x" } });
    expect(err.name).toBe("ApplicationValidationError");
    expect(err.message).toContain("Parse failed");
    expect(err.message).toContain("Invalid request payload");
  });

  it("covers more codes: too_big, invalid_string(email), not_multiple_of, invalid_date, union", () => {
    const schema = z.object({
      email: z.string().email(),
      k: z.number().multipleOf(5),
      n: z.number().max(5),
      u: z.union([z.string(), z.number()]),
      when: z.date(),
    });
    const res = schema.safeParse({
      email: "a",
      k: 3,
      n: 10,
      u: {},
      when: new Date(Number.NaN),
    });
    if (!isZodError(res.error)) throw new Error("Expected ZodError");
    const summary = summarizeZodError(res.error);
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
    const res = schema.safeParse({ type: "c" });
    if (!isZodError(res.error)) throw new Error("Expected ZodError");
    const summary = summarizeZodError(res.error);
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
    const res = schema.safeParse({ type: "c" });
    if (!isZodError(res.error)) throw new Error("Expected ZodError");
    const summary = summarizeZodError(res.error);
    expect(summary).toContain("Invalid discriminator value");
    expect(summary).toContain("expected one of: a, b");
  });
});
