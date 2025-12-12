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
});

describe("createLazyEnv", () => {
  it("supports lazy evaluation", () => {
    const lazy = createLazyEnv(
      {
        FOO: z.string().min(1),
      },
      { source: { FOO: "lazy" } },
    );

    expect(lazy.FOO).toBe("lazy");
  });

  it("evaluates env only once for proxies", () => {
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

  it("throws on first access when env is invalid", () => {
    const lazy = createLazyEnv(
      {
        URL: z.url(),
      },
      { source: { URL: "not-a-url" } },
    );

    expect(() => {
      lazy.URL;
    }).toThrowError(/Invalid env: URL/i);
  });

  it("honors proxy traps for has, ownKeys, and property descriptors", () => {
    const lazy = createLazyEnv(
      {
        BAR: z.string().min(1),
        FOO: z.string().min(1),
      },
      { source: { BAR: "bar", FOO: "foo" } },
    );

    // has trap
    expect("FOO" in lazy).toBe(true);
    expect("BAR" in lazy).toBe(true);
    expect("BAZ" in lazy).toBe(false);

    // ownKeys + getOwnPropertyDescriptor via Object.keys / descriptor lookup
    const keys = Object.keys(lazy);
    expect(keys).toEqual(expect.arrayContaining(["FOO", "BAR"]));

    const desc = Object.getOwnPropertyDescriptor(lazy, "FOO");
    expect(desc?.enumerable).toBe(true);
    expect(desc?.configurable).toBe(true);
    expect(desc?.value).toBe("foo");
  });

  it("bypasses then to avoid thenable behavior in async contexts", async () => {
    const lazy = createLazyEnv(
      {
        FOO: z.string().min(1),
      },
      { source: { FOO: "lazy" } },
    );

    // then trap should be bypassed
    expect("then" in lazy).toBe(false);
    // @ts-expect-error — runtime check for then
    expect(lazy.then).toBeUndefined();

    // Promise resolution should treat the proxy as a plain value
    const resolved = await Promise.resolve(lazy);
    expect(resolved.FOO).toBe("lazy");
  });

  it("prevents mutation via set/delete/defineProperty", () => {
    const lazy = createLazyEnv(
      {
        FOO: z.string().min(1),
      },
      { source: { FOO: "immutable" } },
    );

    expect(() => {
      (lazy as { FOO: string }).FOO = "changed";
    }).toThrow(/Cannot set properties on env object/);

    expect(() => {
      delete (lazy as { FOO?: string }).FOO;
    }).toThrow(/Cannot delete properties from env object/);

    expect(() => {
      Object.defineProperty(lazy, "BAR", { value: "bar" });
    }).toThrow(/Cannot define properties on env object/);

    // Original value remains unchanged
    expect(lazy.FOO).toBe("immutable");
  });
});
