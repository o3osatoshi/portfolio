import { existsSync, mkdtempSync, statSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  execFileMock: vi.fn(),
  homeDir: "",
}));

vi.mock("node:child_process", () => ({
  execFile: h.execFileMock,
}));

vi.mock("node:os", async () => {
  const actual = await vi.importActual<typeof import("node:os")>("node:os");
  return {
    ...actual,
    homedir: () => h.homeDir,
  };
});

describe("lib/token-store", () => {
  beforeEach(() => {
    h.homeDir = mkdtempSync(join(tmpdir(), "o3o-cli-token-store-"));
    h.execFileMock.mockReset();
    h.execFileMock.mockImplementation(
      (
        _file: string,
        _args: readonly string[],
        callback: (error: Error) => void,
      ) => {
        callback(new Error("keychain unavailable"));
      },
    );
    vi.resetModules();
  });

  afterEach(async () => {
    await rm(h.homeDir, { force: true, recursive: true });
  });

  it("persists token set to file fallback with 0600 permissions", async () => {
    const tokenPath = join(h.homeDir, ".config", "o3o", "auth.json");
    const { clearTokenSet, readTokenSet, writeTokenSet } = await import(
      "./token-store"
    );

    await writeTokenSet({
      access_token: "access-token",
      expires_at: 1735689600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    });

    expect(existsSync(tokenPath)).toBe(true);
    expect(statSync(tokenPath).mode & 0o777).toBe(0o600);

    const loaded = await readTokenSet();
    expect(loaded).toEqual({
      access_token: "access-token",
      expires_at: 1735689600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    });

    await clearTokenSet();
    expect(existsSync(tokenPath)).toBe(false);
  });
});
