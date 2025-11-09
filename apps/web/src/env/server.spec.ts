import { beforeEach, describe, expect, it, vi } from "vitest";

const SERVER_PATH = "./server";

describe("apps/web env (server)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("accepts valid DATABASE_URL values", async () => {
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://postgres:postgres@localhost:54329/postgres?schema=public",
    );
    const mod = await import(SERVER_PATH);
    expect(mod.env.DATABASE_URL).toBe(
      "postgresql://postgres:postgres@localhost:54329/postgres?schema=public",
    );
  });
});
