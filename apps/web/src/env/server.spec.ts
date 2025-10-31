import { beforeEach, describe, expect, it, vi } from "vitest";

const SERVER_PATH = "./server";

describe("apps/web env (server)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("accepts valid NODE_ENV values", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const mod = await import(SERVER_PATH);
    expect(mod.env.NODE_ENV).toBe("production");
  });
});
