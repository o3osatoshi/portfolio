import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  statSync,
  writeFileSync,
} from "node:fs";
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
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.resetModules();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(h.homeDir, { force: true, recursive: true });
  });

  it("persists token set to file fallback with 0600 permissions", async () => {
    const tokenPath = join(h.homeDir, ".config", "o3o", "auth.json");
    const { clearTokenSet, readTokenSet, writeTokenSet } = await import(
      "./token-store"
    );

    const writeResult = await writeTokenSet({
      access_token: "access-token",
      expires_at: 1735689600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    });
    expect(writeResult.isOk()).toBe(true);

    expect(existsSync(tokenPath)).toBe(true);
    expect(statSync(tokenPath).mode & 0o777).toBe(0o600);
    expect(console.warn).toHaveBeenCalledTimes(1);

    const loadedResult = await readTokenSet();
    expect(loadedResult.isOk()).toBe(true);
    if (loadedResult.isErr()) throw new Error("Expected ok result");
    const loaded = loadedResult.value;
    expect(loaded).toEqual({
      access_token: "access-token",
      expires_at: 1735689600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    });

    const clearResult = await clearTokenSet();
    expect(clearResult.isOk()).toBe(true);
    expect(existsSync(tokenPath)).toBe(false);
  });

  it("returns null when token file JSON is corrupted", async () => {
    const tokenPath = join(h.homeDir, ".config", "o3o", "auth.json");
    mkdirSync(join(h.homeDir, ".config", "o3o"), { recursive: true });
    writeFileSync(tokenPath, "{broken-json", "utf8");

    const { readTokenSet } = await import("./token-store");
    const result = await readTokenSet();
    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toBeNull();
  });
});
