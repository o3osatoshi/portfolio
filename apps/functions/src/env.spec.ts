import { beforeEach, describe, expect, it, vi } from "vitest";

const ENV_PATH = "./env";

describe("apps/functions env", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("accepts valid DATABASE_URL values", async () => {
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://postgres:postgres@localhost:54329/postgres?schema=public",
    );
    const mod = await import(ENV_PATH);
    expect(mod.env.DATABASE_URL).toBe(
      "postgresql://postgres:postgres@localhost:54329/postgres?schema=public",
    );
  });
});
