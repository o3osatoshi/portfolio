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

import { cliErrorCodes } from "./cli-error-catalog";

const h = vi.hoisted(() => ({
  homeDir: "",
  keychainMode: "ok" as "ok" | "unavailable",
  keychainStore: new Map<string, string>(),
}));

vi.mock("@napi-rs/keyring", () => ({
  Entry: class Entry {
    private readonly key: string;

    constructor(service: string, account: string) {
      this.key = `${service}:${account}`;
    }

    async deletePassword(): Promise<void> {
      if (h.keychainMode === "unavailable") {
        throw new Error("keychain unavailable");
      }
      if (!h.keychainStore.has(this.key)) {
        throw new Error("password not found");
      }
      h.keychainStore.delete(this.key);
    }

    async getPassword(): Promise<string> {
      if (h.keychainMode === "unavailable") {
        throw new Error("keychain unavailable");
      }
      const value = h.keychainStore.get(this.key);
      if (!value) {
        throw new Error("password not found");
      }
      return value;
    }

    async setPassword(value: string): Promise<void> {
      if (h.keychainMode === "unavailable") {
        throw new Error("keychain unavailable");
      }
      h.keychainStore.set(this.key, value);
    }
  },
}));

vi.mock("node:os", async () => {
  const actual = await vi.importActual<typeof import("node:os")>("node:os");
  return {
    ...actual,
    homedir: () => h.homeDir,
  };
});

describe("lib/token-store", () => {
  const keychainTokenKey = "o3o-cli:default";
  const tokenPath = () => join(h.homeDir, ".config", "o3o", "auth.json");

  beforeEach(() => {
    h.homeDir = mkdtempSync(join(tmpdir(), "o3o-cli-token-store-"));
    h.keychainMode = "ok";
    h.keychainStore.clear();
    delete process.env["O3O_ALLOW_FILE_TOKEN_STORE"];
    delete process.env["O3O_TOKEN_STORE_BACKEND"];
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.resetModules();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(h.homeDir, { force: true, recursive: true });
  });

  it("stores token in keychain and avoids file fallback when keychain is available", async () => {
    const { clearTokenSet, readTokenSet, writeTokenSet } = await import(
      "./token-store"
    );

    const token = {
      access_token: "access-token",
      expires_at: 1735689600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    };

    const writeResult = await writeTokenSet(token);
    expect(writeResult.isOk()).toBe(true);
    expect(h.keychainStore.get(keychainTokenKey)).toBe(JSON.stringify(token));
    expect(existsSync(tokenPath())).toBe(false);
    expect(console.warn).not.toHaveBeenCalled();

    const loadedResult = await readTokenSet();
    expect(loadedResult.isOk()).toBe(true);
    if (loadedResult.isErr()) throw new Error("Expected ok result");
    expect(loadedResult.value).toEqual(token);

    const clearResult = await clearTokenSet();
    expect(clearResult.isOk()).toBe(true);
    expect(h.keychainStore.size).toBe(0);
    expect(existsSync(tokenPath())).toBe(false);
  });

  it("returns backend-unavailable error when keychain is unavailable and file fallback is not opted-in", async () => {
    h.keychainMode = "unavailable";
    const { readTokenSet, writeTokenSet } = await import("./token-store");

    const writeResult = await writeTokenSet({
      access_token: "access-token",
      expires_at: 1735689600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    });
    expect(writeResult.isErr()).toBe(true);
    if (writeResult.isOk()) throw new Error("Expected err result");
    expect(writeResult.error.code).toBe(
      cliErrorCodes.CLI_TOKEN_STORE_BACKEND_UNAVAILABLE,
    );
    expect(existsSync(tokenPath())).toBe(false);

    const loadedResult = await readTokenSet();
    expect(loadedResult.isErr()).toBe(true);
    if (loadedResult.isOk()) throw new Error("Expected err result");
    expect(loadedResult.error.code).toBe(
      cliErrorCodes.CLI_TOKEN_STORE_BACKEND_UNAVAILABLE,
    );
  });

  it("uses file backend when O3O_TOKEN_STORE_BACKEND=file", async () => {
    h.keychainMode = "unavailable";
    process.env["O3O_TOKEN_STORE_BACKEND"] = "file";

    const { clearTokenSet, readTokenSet, writeTokenSet } = await import(
      "./token-store"
    );

    const token = {
      access_token: "access-token",
      expires_at: 1735689600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    };

    const writeResult = await writeTokenSet(token);
    expect(writeResult.isOk()).toBe(true);
    expect(existsSync(tokenPath())).toBe(true);
    expect(h.keychainStore.size).toBe(0);

    const readResult = await readTokenSet();
    expect(readResult.isOk()).toBe(true);
    if (readResult.isErr()) throw new Error("Expected ok result");
    expect(readResult.value).toEqual(token);

    const clearResult = await clearTokenSet();
    expect(clearResult.isOk()).toBe(true);
    expect(existsSync(tokenPath())).toBe(false);
  });

  it("uses keychain backend only when O3O_TOKEN_STORE_BACKEND=keychain", async () => {
    h.keychainMode = "unavailable";
    process.env["O3O_TOKEN_STORE_BACKEND"] = "keychain";

    const { readTokenSet, writeTokenSet } = await import("./token-store");

    const writeResult = await writeTokenSet({
      access_token: "access-token",
      expires_at: 1735689600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    });
    expect(writeResult.isErr()).toBe(true);
    if (writeResult.isOk()) throw new Error("Expected err result");
    expect(writeResult.error.code).toBe(
      cliErrorCodes.CLI_TOKEN_STORE_BACKEND_UNAVAILABLE,
    );

    const readResult = await readTokenSet();
    expect(readResult.isErr()).toBe(true);
    if (readResult.isOk()) throw new Error("Expected err result");
    expect(readResult.error.code).toBe(
      cliErrorCodes.CLI_TOKEN_STORE_BACKEND_UNAVAILABLE,
    );
  });

  it("falls back to file storage when keychain is unavailable and opt-in is enabled", async () => {
    h.keychainMode = "unavailable";
    process.env["O3O_ALLOW_FILE_TOKEN_STORE"] = "1";
    const { clearTokenSet, readTokenSet, writeTokenSet } = await import(
      "./token-store"
    );

    const token = {
      access_token: "access-token",
      expires_at: 1735689600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    };

    const writeResult = await writeTokenSet(token);
    expect(writeResult.isOk()).toBe(true);
    expect(existsSync(tokenPath())).toBe(true);
    expect(statSync(tokenPath()).mode & 0o777).toBe(0o600);
    expect(console.warn).toHaveBeenCalledTimes(1);

    const readResult = await readTokenSet();
    expect(readResult.isOk()).toBe(true);
    if (readResult.isErr()) throw new Error("Expected ok result");
    expect(readResult.value).toEqual(token);

    const clearResult = await clearTokenSet();
    expect(clearResult.isOk()).toBe(true);
    expect(existsSync(tokenPath())).toBe(false);
  });

  it("prefers fresher file token over stale keychain token and migrates it back to keychain", async () => {
    const staleToken = {
      access_token: "stale-access-token",
      expires_at: 1730000000,
      refresh_token: "stale-refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    };
    const freshToken = {
      access_token: "fresh-access-token",
      expires_at: 1735689600,
      refresh_token: "fresh-refresh-token",
      scope: "openid profile email",
      token_type: "Bearer",
    };
    h.keychainStore.set(keychainTokenKey, JSON.stringify(staleToken));
    mkdirSync(join(h.homeDir, ".config", "o3o"), { recursive: true });
    writeFileSync(tokenPath(), `${JSON.stringify(freshToken)}\n`, "utf8");

    const { readTokenSet } = await import("./token-store");
    const result = await readTokenSet();

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toEqual(freshToken);
    expect(h.keychainStore.get(keychainTokenKey)).toBe(
      JSON.stringify(freshToken),
    );
    expect(existsSync(tokenPath())).toBe(false);
  });

  it("returns null when both stores have no valid token JSON", async () => {
    h.keychainStore.set(keychainTokenKey, "{broken-json");
    mkdirSync(join(h.homeDir, ".config", "o3o"), { recursive: true });
    writeFileSync(tokenPath(), "{broken-json", "utf8");

    const { readTokenSet } = await import("./token-store");
    const result = await readTokenSet();
    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toBeNull();
  });
});
