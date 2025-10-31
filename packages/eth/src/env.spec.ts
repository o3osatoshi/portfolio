import { beforeEach, describe, expect, it, vi } from "vitest";

const ENV_PATH = "./env";

describe("packages/eth env", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("requires ETHERSCAN_API_KEY", async () => {
    vi.stubEnv("ETHERSCAN_API_KEY", "test-key");
    const mod = await import(ENV_PATH);
    expect(mod.env.ETHERSCAN_API_KEY).toBe("test-key");
  });

  it("throws when ETHERSCAN_API_KEY is missing", async () => {
    // simulate missing by stubbing to empty string
    vi.stubEnv("ETHERSCAN_API_KEY", "");
    await expect(import(ENV_PATH)).rejects.toThrow(/Invalid eth env/i);
  });
});
