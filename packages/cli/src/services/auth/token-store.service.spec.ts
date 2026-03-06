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

import { cliErrorCodes } from "../../common/error-catalog";

const h = vi.hoisted(() => ({
  homeDir: "",
  keychainConstructFailuresRemaining: 0,
  keychainMode: "ok" as "ok" | "unavailable",
  keychainStore: new Map<string, string>(),
}));

vi.mock("@napi-rs/keyring", () => ({
  Entry: class Entry {
    private readonly key: string;

    constructor(service: string, account: string) {
      if (h.keychainConstructFailuresRemaining > 0) {
        h.keychainConstructFailuresRemaining -= 1;
        throw new Error("keychain entry init failed");
      }
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

describe("services/auth/token-store.service", () => {
  const keychainTokenKey = "o3o-cli:default";
  const tokenPath = () => {
    if (process.platform === "win32") {
      const appData = process.env["APPDATA"];
      const basePath = appData?.trim()
        ? appData.trim()
        : join(h.homeDir, "AppData", "Roaming");
      return join(basePath, "o3o", "auth.json");
    }

    const xdgConfigHome = process.env["XDG_CONFIG_HOME"]?.trim();
    const basePath = xdgConfigHome ? xdgConfigHome : join(h.homeDir, ".config");
    return join(basePath, "o3o", "auth.json");
  };

  beforeEach(() => {
    h.keychainConstructFailuresRemaining = 0;
    h.homeDir = mkdtempSync(join(tmpdir(), "o3o-cli-token-store-"));
    h.keychainMode = "ok";
    h.keychainStore.clear();
    delete process.env["O3O_ALLOW_FILE_TOKEN_STORE"];
    delete process.env["O3O_TOKEN_STORE_BACKEND"];
    delete process.env["XDG_CONFIG_HOME"];
    delete process.env["APPDATA"];
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.resetModules();
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(h.homeDir, { force: true, recursive: true });
  });

  it("stores token in keychain and avoids file fallback when keychain is available", async () => {
    const { clearTokenSet, readTokenSet, writeTokenSet } = await import(
      "./token-store.service"
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
    const { readTokenSet, writeTokenSet } = await import(
      "./token-store.service"
    );

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
    expect(writeResult.error.details?.reason).toContain(
      "O3O_ALLOW_FILE_TOKEN_STORE=1",
    );
    expect(writeResult.error.details?.reason).toContain(
      "O3O_TOKEN_STORE_BACKEND=file",
    );
    expect(existsSync(tokenPath())).toBe(false);

    const loadedResult = await readTokenSet();
    expect(loadedResult.isErr()).toBe(true);
    if (loadedResult.isOk()) throw new Error("Expected err result");
    expect(loadedResult.error.code).toBe(
      cliErrorCodes.CLI_TOKEN_STORE_BACKEND_UNAVAILABLE,
    );
    expect(loadedResult.error.details?.reason).toContain(
      "O3O_ALLOW_FILE_TOKEN_STORE=1",
    );
  });

  it("uses file backend when O3O_TOKEN_STORE_BACKEND=file", async () => {
    h.keychainMode = "unavailable";
    process.env["O3O_TOKEN_STORE_BACKEND"] = "file";

    const { clearTokenSet, readTokenSet, writeTokenSet } = await import(
      "./token-store.service"
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

  it("uses XDG_CONFIG_HOME for file backend on non-windows platforms", async () => {
    if (process.platform === "win32") return;

    const xdgConfigHome = join(h.homeDir, ".xdg-config");
    process.env["O3O_TOKEN_STORE_BACKEND"] = "file";
    process.env["XDG_CONFIG_HOME"] = xdgConfigHome;

    const { readTokenSet, writeTokenSet } = await import(
      "./token-store.service"
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
    expect(existsSync(join(xdgConfigHome, "o3o", "auth.json"))).toBe(true);
    expect(existsSync(join(h.homeDir, ".config", "o3o", "auth.json"))).toBe(
      false,
    );

    const readResult = await readTokenSet();
    expect(readResult.isOk()).toBe(true);
    if (readResult.isErr()) throw new Error("Expected ok result");
    expect(readResult.value).toEqual(token);
  });

  it("uses keychain backend only when O3O_TOKEN_STORE_BACKEND=keychain", async () => {
    h.keychainMode = "unavailable";
    process.env["O3O_TOKEN_STORE_BACKEND"] = "keychain";

    const { readTokenSet, writeTokenSet } = await import(
      "./token-store.service"
    );

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
    expect(writeResult.error.details?.reason).toContain(
      "O3O_TOKEN_STORE_BACKEND=file",
    );

    const readResult = await readTokenSet();
    expect(readResult.isErr()).toBe(true);
    if (readResult.isOk()) throw new Error("Expected err result");
    expect(readResult.error.code).toBe(
      cliErrorCodes.CLI_TOKEN_STORE_BACKEND_UNAVAILABLE,
    );
    expect(readResult.error.details?.reason).toContain(
      "O3O_TOKEN_STORE_BACKEND=file",
    );
  });

  it("returns config error when O3O_TOKEN_STORE_BACKEND is invalid", async () => {
    process.env["O3O_TOKEN_STORE_BACKEND"] = "invalid-backend";
    const { writeTokenSet } = await import("./token-store.service");

    const token = {
      access_token: "access-token",
      expires_at: 1735689600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    };

    const writeResult = await writeTokenSet(token);
    expect(writeResult.isErr()).toBe(true);
    if (writeResult.isOk()) throw new Error("Expected err result");
    expect(writeResult.error.code).toBe(cliErrorCodes.CLI_CONFIG_INVALID);
    expect(writeResult.error.details?.reason).toMatch(/tokenStoreBackend/i);
  });

  it("recovers from transient keychain entry load failure", async () => {
    h.keychainConstructFailuresRemaining = 1;
    const { writeTokenSet } = await import("./token-store.service");

    const token = {
      access_token: "access-token",
      expires_at: 1735689600,
      refresh_token: "refresh-token",
      scope: "openid profile",
      token_type: "Bearer",
    };

    const firstWriteResult = await writeTokenSet(token);
    expect(firstWriteResult.isErr()).toBe(true);

    const secondWriteResult = await writeTokenSet(token);
    expect(secondWriteResult.isOk()).toBe(true);
    expect(h.keychainStore.get(keychainTokenKey)).toBe(JSON.stringify(token));
  });

  it("falls back to file storage when keychain is unavailable and opt-in is enabled", async () => {
    h.keychainMode = "unavailable";
    process.env["O3O_ALLOW_FILE_TOKEN_STORE"] = "1";
    const { clearTokenSet, readTokenSet, writeTokenSet } = await import(
      "./token-store.service"
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

    const { readTokenSet } = await import("./token-store.service");
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

    const { readTokenSet } = await import("./token-store.service");
    const result = await readTokenSet();
    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toBeNull();
  });
});
