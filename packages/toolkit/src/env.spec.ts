import { describe, expect, it } from "vitest";
import { z } from "zod";

import { createEnv, type CreateEnvOptions, createLazyEnv } from "./env";

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

  it("supports lazy evaluation via createLazyEnv", () => {
    const lazy = createLazyEnv(
      {
        FOO: z.string().min(1),
      },
      { source: { FOO: "lazy" } },
    );

    expect(lazy.FOO).toBe("lazy");
  });

  it("evaluates env only once for lazy proxies", () => {
    let calls = 0;
    const lazy = createLazyEnv(
      {
        FOO: z.string().min(1),
      },
      {
        get source() {
          calls += 1;
          return { FOO: "cached" };
        },
      } as CreateEnvOptions,
    );

    // multiple property accesses should reuse the cached value
    expect(lazy.FOO).toBe("cached");
    expect(lazy.FOO).toBe("cached");
    expect(calls).toBe(1);
  });
});
