import { beforeEach, describe, expect, it, vi } from "vitest";

const ENV_PATH = "./env";

describe("packages/prisma env", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("requires DATABASE_URL", async () => {
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db");
    const mod = await import(ENV_PATH);
    expect(mod.env.DATABASE_URL).toContain("postgresql://");
  });

  it("throws when DATABASE_URL invalid or missing", async () => {
    // simulate missing by stubbing to empty string (violates min(1))
    vi.stubEnv("DATABASE_URL", "");
    await expect(import(ENV_PATH)).rejects.toThrow(/Invalid prisma env/i);
  });
});
