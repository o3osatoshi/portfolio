import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseAsyncWith, parseWith } from "./zod-parse";

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
      expect(res.error.message).toContain("ParseUser failed");
      expect(res.error.message).toContain(
        "name: Expected string, received number",
      );
      expect(res.error.message).toContain(
        "age: Expected number, received string",
      );
    }
  });

  it("respects custom layer in error name", () => {
    const schema = z.object({ email: z.string().email() });
    const parse = parseWith(schema, { action: "ParseForm", layer: "UI" });
    const res = parse({ email: "invalid" });
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("UIValidationError");
      expect(res.error.message).toContain("ParseForm failed");
      expect(res.error.message).toContain("email: Invalid string (email)");
    }
  });
});

describe("zod-parse: parseAsyncWith", () => {
  it("handles async refinement and returns ok", async () => {
    const schema = z.object({
      token: z.string().refine(async (v) => v === "ok", {
        message: "bad token",
      }),
    });
    const parseAsync = parseAsyncWith(schema, { action: "ParseToken" });
    const res = await parseAsync({ token: "ok" });
    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value).toEqual({ token: "ok" });
    }
  });

  it("handles async refinement and returns err with custom message", async () => {
    const schema = z.object({
      token: z.string().refine(async (v) => v === "ok", {
        message: "bad token",
      }),
    });
    const parseAsync = parseAsyncWith(schema, {
      action: "ParseToken",
      layer: "Auth",
    });
    const res = await parseAsync({ token: "ng" });
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("AuthValidationError");
      expect(res.error.message).toContain("ParseToken failed");
      expect(res.error.message).toContain("token: bad token");
    }
  });
});
