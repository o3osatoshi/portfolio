import { describe, expect, it } from "vitest";
import { z } from "zod";

import { isRichError } from "../error";
import {
  isZodError,
  newZodError,
  summarizeZodError,
  summarizeZodIssue,
  toValidationIssues,
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

  it("summarizeZodIssue includes path and key validation keywords", () => {
    const schema1 = z.string();
    const err1 = parseZodError(schema1, 42);
    const issue1 = err1.issues[0];
    if (issue1 === undefined) throw new Error("Expected an issue");
    const s1 = summarizeZodIssue(issue1);
    expect(s1).toContain("(root):");
    expect(s1.toLowerCase()).toContain("expected string");

    const schema2 = z.object({ type: z.enum(["BUY", "SELL"]) });
    const err2 = parseZodError(schema2, { type: "HOGE" });
    const issue2 = err2.issues[0];
    if (issue2 === undefined) throw new Error("Expected an issue");
    const s2 = summarizeZodIssue(issue2);
    expect(s2).toContain("type:");
    expect(s2).toMatch(/BUY/);
    expect(s2).toMatch(/SELL/);
  });

  it("summarizeZodError joins multiple issues with semicolons", () => {
    const schema = z.object({ a: z.string().min(3), b: z.number().max(5) });
    const err = parseZodError(schema, { a: "", b: 10 });
    const s = summarizeZodError(err);
    expect(s).toContain("a:");
    expect(s).toContain("b:");
    expect(s.split("; ").length).toBeGreaterThanOrEqual(2);
  });

  it("newZodError builds ApplicationValidationError without inferred hint", () => {
    const schema = z.object({ name: z.string() });
    const err = newZodError({
      cause: parseZodError(schema, { name: 123 }),
      details: { action: "ParseUser" },
    });
    expect(err.name).toBe("ApplicationValidationError");
    const message = err.message;
    expect(message).toContain("ParseUser failed:");
    expect(message).toContain("name:");
    expect(message.toLowerCase()).toContain("expected string");
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.hint).toBeUndefined();
    }
  });

  it("newZodError supports custom layer with zod cause (unrecognized_keys)", () => {
    const strictSchema = z.object({ a: z.string() }).strict();
    const errCause = parseZodError(strictSchema, { a: "x", extra: 1 });
    const err = newZodError({
      cause: errCause,
      details: { action: "ValidateForm" },
      layer: "Presentation",
    });
    expect(err.name).toBe("PresentationValidationError");
    const message = err.message;
    expect(message).toContain("ValidateForm failed:");
    expect(message).toContain("extra");
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.hint).toBeUndefined();
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

  it("toValidationIssues projects path/code/message with root fallback", () => {
    const schema = z.object({ name: z.string() });
    const err = parseZodError(schema, { name: 123 });

    const issues = toValidationIssues(err);
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({
      code: "invalid_type",
      path: "name",
    });
    expect(issues[0]?.message.toLowerCase()).toContain("expected string");

    const rootErr = parseZodError(z.string(), 42);
    const rootIssues = toValidationIssues(rootErr);
    expect(rootIssues).toHaveLength(1);
    expect(rootIssues[0]).toMatchObject({
      code: "invalid_type",
      path: "(root)",
    });
    expect(rootIssues[0]?.message.toLowerCase()).toContain("expected string");
  });

  it("toValidationIssues supports custom root path labels", () => {
    const rootErr = parseZodError(z.string(), 42);
    const rootIssues = toValidationIssues(rootErr, { rootPath: "<root>" });

    expect(rootIssues).toHaveLength(1);
    expect(rootIssues[0]).toMatchObject({
      code: "invalid_type",
      path: "<root>",
    });
  });

  it("newZodError appends validationIssues into meta when requested", () => {
    const schema = z.object({ name: z.string() });
    const err = newZodError({
      includeValidationIssues: true,
      cause: parseZodError(schema, { name: 123 }),
      details: { action: "ParseUser" },
      meta: {
        source: "spec",
      },
    });

    expect(err.meta).toMatchObject({
      validationIssues: [
        {
          code: "invalid_type",
          path: "name",
        },
      ],
      source: "spec",
    });
    const firstIssue = (
      err.meta?.["validationIssues"] as Array<{ message?: string }> | undefined
    )?.[0];
    expect(firstIssue?.message?.toLowerCase()).toContain("expected string");
  });

  it("covers common issue codes with path-aware summary", () => {
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
    expect(summary).toContain("n:");
    expect(summary).toContain("email:");
    expect(summary).toContain("k:");
    expect(summary).toContain("when:");
    expect(summary).toContain("u:");
  });

  it("handles invalid union discriminator with non-empty message", () => {
    const schema = z.discriminatedUnion("type", [
      z.object({ a: z.string(), type: z.literal("a") }),
      z.object({ b: z.number(), type: z.literal("b") }),
    ]);
    const err = parseZodError(schema, { type: "c" });
    const summary = summarizeZodError(err);
    expect(summary).toContain("type:");
    expect(summary).toMatch(/Invalid/i);
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
    expect(summary).toContain("expected one of: a, b");
  });
});
