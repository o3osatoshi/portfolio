import { beforeEach, describe, expect, it, vi } from "vitest";

const SERVER_PATH = "./server";

describe("apps/web env (server)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("accepts valid DATABASE_URL values", async () => {
    vi.stubEnv("AUTH_GOOGLE_ID", "test-google-id");
    vi.stubEnv("AUTH_GOOGLE_SECRET", "test-google-secret");
    vi.stubEnv("AUTH_SECRET", "test-auth-secret");
    vi.stubEnv("AXIOM_API_TOKEN", "test-axiom-token");
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://postgres:postgres@localhost:54329/postgres?schema=public",
    );
    vi.stubEnv("EXCHANGE_RATE_API_KEY", "test-exchange-rate-key");
    vi.stubEnv("EXCHANGE_RATE_BASE_URL", "https://v6.exchangerate-api.com/v6");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-token");
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://example.upstash.io");
    const mod = await import(SERVER_PATH);
    expect(mod.env.DATABASE_URL).toBe(
      "postgresql://postgres:postgres@localhost:54329/postgres?schema=public",
    );
    expect(mod.env.EXCHANGE_RATE_API_KEY).toBe("test-exchange-rate-key");
    expect(mod.env.EXCHANGE_RATE_BASE_URL).toBe(
      "https://v6.exchangerate-api.com/v6",
    );
  });
});
