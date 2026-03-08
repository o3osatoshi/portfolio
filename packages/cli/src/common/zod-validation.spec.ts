import { describe, expect, it } from "vitest";
import { z } from "zod";

import { extractValidationIssues, makeCliSchemaParser } from "./zod-validation";

describe("common/zod-validation", () => {
  it("prefixes validation reason with context", () => {
    const schema = z.object({
      name: z.string(),
    });

    const parsed = makeCliSchemaParser(schema, {
      action: "ParseName",
      code: "CLI_COMMAND_INVALID_ARGUMENT",
      context: "name argument",
      fallbackHint: "Use `--name <value>`.",
    })({ name: 123 });

    expect(parsed.isErr()).toBe(true);
    if (parsed.isErr()) {
      expect(parsed.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
      const reason = parsed.error.details?.reason;
      expect(reason).toContain("Invalid name argument: name:");
      expect(reason?.toLowerCase()).toContain("expected string");
    }
  });

  it("uses fallback hint when no explicit hint exists", () => {
    const schema = z.object({
      name: z.string(),
    });

    const parsed = makeCliSchemaParser(schema, {
      action: "ParseName",
      code: "CLI_COMMAND_INVALID_ARGUMENT",
      context: "name argument",
      fallbackHint: "Use `--name <value>`.",
    })({ name: 123 });

    expect(parsed.isErr()).toBe(true);
    if (parsed.isErr()) {
      expect(parsed.error.details?.hint).toBe("Use `--name <value>`.");
    }
  });

  it("uses fallback hint when zod inference has no hint", () => {
    const schema = z.object({
      name: z.string().refine((value) => value === "ok", "Must be ok"),
    });

    const parsed = makeCliSchemaParser(schema, {
      action: "ParseName",
      code: "CLI_COMMAND_INVALID_ARGUMENT",
      context: "name argument",
      fallbackHint: "Use `--name ok`.",
    })({ name: "ng" });

    expect(parsed.isErr()).toBe(true);
    if (parsed.isErr()) {
      expect(parsed.error.details?.hint).toBe("Use `--name ok`.");
    }
  });

  it("extracts compact validation issues from error meta", () => {
    const schema = z.object({
      name: z.string(),
    });

    const parsed = makeCliSchemaParser(schema, {
      action: "ParseName",
      code: "CLI_COMMAND_INVALID_ARGUMENT",
      context: "name argument",
    })({ name: 123 });

    expect(parsed.isErr()).toBe(true);
    if (parsed.isErr()) {
      const issues = extractValidationIssues(parsed.error);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({
        code: "invalid_type",
        path: "name",
      });
      expect(issues[0]?.message.toLowerCase()).toContain("expected string");
    }
  });
});
