import { beforeEach, describe, expect, it, vi } from "vitest";

const CLIENT_PATH = "./client";

describe("apps/web env (client)", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("loads when public vars are set", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://example.com");
    vi.stubEnv("NEXT_PUBLIC_RAINBOW_PROJECT_ID", "proj-123");

    const mod = await import(CLIENT_PATH);
    expect(mod.env.NEXT_PUBLIC_API_BASE_URL).toBe("https://example.com");
    expect(mod.env.NEXT_PUBLIC_RAINBOW_PROJECT_ID).toBe("proj-123");
  });

  it("fails when a required public var is missing", async () => {
    // simulate missing by stubbing to empty string (violates schema)
    vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_RAINBOW_PROJECT_ID", "proj-123");

    await expect(import(CLIENT_PATH)).rejects.toThrow(
      /Invalid web:client env/i,
    );
  });
});
