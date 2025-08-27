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

  it("summarizeZodIssue handles invalid_type and invalid_enum_value", () => {
    const schema1 = z.string();
    const res1 = schema1.safeParse(42);
    if (res1.success) throw new Error("Expected failure");
    const s1 = summarizeZodIssue(res1.error.issues[0]);
    expect(s1).toContain("(root): Expected string, received number");

    const schema2 = z.object({ type: z.enum(["BUY", "SELL"]) });
    const res2 = schema2.safeParse({ type: "HOGE" });
    if (res2.success) throw new Error("Expected failure");
    const s2 = summarizeZodIssue(res2.error.issues[0]);
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
    expect(err.message).toContain("ParseUser failed");
    expect(err.message).toContain(
      "because name: Expected string, received number",
    );
    expect(err.message).toContain("Hint: Check field types match the schema.");
  });

  it("newZodError supports custom layer and issues without cause (unrecognized_keys)", () => {
    const strictSchema = z.object({ a: z.string() }).strict();
    const res = strictSchema.safeParse({ a: "x", extra: 1 });
    if (res.success) throw new Error("Expected failure");
    const err = newZodError({
      layer: "UI",
      action: "ValidateForm",
      issues: res.error.issues,
    });
    expect(err.name).toBe("UIValidationError");
    expect(err.message).toContain("ValidateForm failed");
    expect(err.message).toContain("Unrecognized keys:");
    expect(err.message).toContain(
      "Hint: Remove unknown fields from the payload.",
    );
  });

  it("newZodError falls back to generic reason when no issues", () => {
    const err = newZodError({ action: "Parse", cause: { message: "x" } });
    expect(err.name).toBe("ApplicationValidationError");
    expect(err.message).toContain("Parse failed");
    expect(err.message).toContain("because Invalid request payload");
  });

  it("covers more codes: too_big, invalid_string(email), not_multiple_of, invalid_date, union", () => {
    const schema = z.object({
      n: z.number().max(5),
      email: z.string().email(),
      k: z.number().multipleOf(5),
      when: z.date(),
      u: z.union([z.string(), z.number()]),
    });
    const res = schema.safeParse({
      n: 10,
      email: "a",
      k: 3,
      when: new Date(Number.NaN),
      u: {},
    });
    if (!isZodError(res.error)) throw new Error("Expected ZodError");
    const summary = summarizeZodError(res.error);
    expect(summary).toContain("n: Too big number: max 5");
    expect(summary).toContain("email: Invalid string (email)");
    expect(summary).toContain("k: Not a multiple of 5");
    expect(summary).toContain("when: Invalid date");
    expect(summary).toContain("u: Invalid value for union type");
  });

  it("handles invalid_union_discriminator without accessing non-existent received", () => {
    const schema = z.discriminatedUnion("type", [
      z.object({ type: z.literal("a"), a: z.string() }),
      z.object({ type: z.literal("b"), b: z.number() }),
    ]);
    const res = schema.safeParse({ type: "c" });
    if (!isZodError(res.error)) throw new Error("Expected ZodError");
    const summary = summarizeZodError(res.error);
    expect(summary).toContain("Invalid discriminator value");
    expect(summary).toContain("expected one of: a, b");
  });
});
