import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createEnv } from "./env";

describe("createEnv", () => {
  it("returns typed values using provided source", () => {
    const env = createEnv(
      {
        BAR: z.coerce.number().int(),
        FOO: z.string().min(1),
      },
      { source: { BAR: "42", FOO: "hello" } },
    );

    // Type + value assertions
    expect(env.FOO).toBe("hello");
    expect(env.BAR).toBe(42);
  });

  it("applies defaults from schema and validates", () => {
    const env = createEnv(
      {
        NODE_ENV: z
          .enum(["development", "test", "production"])
          .default("development"),
      },
      { source: {} },
    );

    expect(env.NODE_ENV).toBe("development");
  });

  it("throws with descriptive message on invalid env", () => {
    expect(() =>
      createEnv(
        {
          URL: z.url(),
        },
        { source: { URL: "not-a-url" } },
      ),
    ).toThrowError(/Invalid env: URL/i);
  });
});
