import { describe, expect, it } from "vitest";
import { z } from "zod";

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
      expect(message).toContain("name: Expected string, received number");
      expect(message).toContain("age: Expected number, received string");
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
      expect(message).toContain("email: Invalid string (email)");
    }
  });
});
