import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

import { errAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import { newRichError, type RichError, toRichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./cli-error-catalog";
import { parseCliWithSchema } from "./cli-zod";
import type { TokenSet } from "./types";

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_at: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
});

const tokenStoreBackendSchema = z
  .enum(["auto", "file", "keychain"])
  .catch("auto");
const fileFallbackEnvSchema = z.enum(["0", "1"]).catch("0");

const SERVICE = "o3o-cli";
const ACCOUNT = "default";
const filePath = join(homedir(), ".config", "o3o", "auth.json");
const fileFallbackEnvName = "O3O_ALLOW_FILE_TOKEN_STORE";
const tokenStoreBackendEnvName = "O3O_TOKEN_STORE_BACKEND";
let didWarnFileFallback = false;
let keychainEntryPromise: Promise<KeychainEntry> | undefined;
const keychainUnavailableReason =
  "Secure token storage (OS keychain) is unavailable. Set O3O_ALLOW_FILE_TOKEN_STORE=1 only if you accept file-based token storage.";

type KeychainEntry = {
  deletePassword(): MaybePromise<boolean | undefined>;
  getPassword(): MaybePromise<null | string | undefined>;
  setPassword(value: string): MaybePromise<void>;
};

type KeychainReadResult =
  | { available: false; cause: unknown }
  | { available: true; token: null | TokenSet };
type KeychainWriteResult = { cause: unknown; ok: false } | { ok: true };
type MaybePromise<T> = Promise<T> | T;
type TokenStoreBackend = "auto" | "file" | "keychain";

export function clearTokenSet(): ResultAsync<void, RichError> {
  const backend = getTokenStoreBackend();

  return ResultAsync.fromPromise(
    (async () => {
      if (backend === "file") {
        await rm(filePath, { force: true });
        return;
      }

      if (backend === "keychain") {
        await deleteKeychainToken({ strict: true });
        return;
      }

      await deleteKeychainToken({ strict: false });
      await rm(filePath, { force: true });
    })(),
    (cause) =>
      toRichError(cause, {
        code: cliErrorCodes.CLI_TOKEN_STORE_CLEAR_FAILED,
        details: {
          action: "ClearTokenSet",
          reason: "Failed to clear local token state.",
        },
        isOperational: true,
        kind: "Internal",
        layer: "Presentation",
      }),
  );
}

export function readTokenSet(): ResultAsync<null | TokenSet, RichError> {
  const backend = getTokenStoreBackend();

  return ResultAsync.fromPromise(
    (async () => {
      if (backend === "file") {
        return await getFileToken();
      }

      const keychainResult = await getKeychainToken();
      if (backend === "keychain") {
        if (!keychainResult.available) {
          throw newBackendUnavailableError(
            "ReadTokenSet",
            keychainResult.cause,
          );
        }
        return keychainResult.token;
      }

      const fileToken = await getFileToken();
      if (!keychainResult.available) {
        if (!isFileFallbackAllowed()) {
          throw newBackendUnavailableError(
            "ReadTokenSet",
            keychainResult.cause,
          );
        }
        if (!fileToken) return null;
        warnFileFallbackOnce();
        return fileToken;
      }

      const selected = selectTokenSource(keychainResult.token, fileToken);
      if (!selected) return null;

      if (selected.source === "keychain") {
        await rm(filePath, { force: true }).catch(() => undefined);
        return selected.token;
      }

      const syncResult = await setKeychainToken(JSON.stringify(selected.token));
      if (syncResult.ok) {
        await rm(filePath, { force: true }).catch(() => undefined);
        return selected.token;
      }

      if (!isFileFallbackAllowed()) {
        throw newRichError({
          cause: syncResult.cause,
          code: cliErrorCodes.CLI_TOKEN_STORE_MIGRATION_FAILED,
          details: {
            action: "MigrateTokenStore",
            reason:
              "Failed to migrate file-based token state to secure token storage.",
          },
          isOperational: true,
          kind: "Internal",
          layer: "Presentation",
        });
      }

      warnFileFallbackOnce();
      return selected.token;
    })(),
    (cause) =>
      toRichError(cause, {
        code: cliErrorCodes.CLI_TOKEN_STORE_READ_FAILED,
        details: {
          action: "ReadTokenSet",
          reason: "Failed to read local token state.",
        },
        isOperational: true,
        kind: "Internal",
        layer: "Presentation",
      }),
  );
}

export function writeTokenSet(
  tokenSet: TokenSet,
): ResultAsync<void, RichError> {
  const backend = getTokenStoreBackend();
  const parsed = parseCliWithSchema(tokenSchema, tokenSet, {
    action: "WriteTokenSet",
    code: cliErrorCodes.CLI_TOKEN_STORE_WRITE_FAILED,
    context: "token payload",
    fallbackHint: "Run `o3o auth login` to refresh local credentials.",
  });
  if (parsed.isErr()) {
    return errAsync(parsed.error);
  }

  const serialized = JSON.stringify(parsed.value);
  return ResultAsync.fromPromise(
    (async () => {
      if (backend === "file") {
        await persistTokenToFile(serialized);
        return;
      }

      const keychainWrite = await setKeychainToken(serialized);
      if (backend === "keychain") {
        if (!keychainWrite.ok) {
          throw newBackendUnavailableError(
            "WriteTokenSet",
            keychainWrite.cause,
          );
        }
        await rm(filePath, { force: true }).catch(() => undefined);
        return;
      }

      if (keychainWrite.ok) {
        await rm(filePath, { force: true }).catch(() => undefined);
        return;
      }

      if (!isFileFallbackAllowed()) {
        throw newBackendUnavailableError("WriteTokenSet", keychainWrite.cause);
      }

      warnFileFallbackOnce();
      await persistTokenToFile(serialized);
    })(),
    (cause) =>
      toRichError(cause, {
        code: cliErrorCodes.CLI_TOKEN_STORE_WRITE_FAILED,
        details: {
          action: "WriteTokenSet",
          reason: "Failed to persist token state.",
        },
        isOperational: true,
        kind: "Internal",
        layer: "Presentation",
      }),
  );
}

async function deleteKeychainToken(options: {
  strict: boolean;
}): Promise<void> {
  try {
    const keychainEntry = await getKeychainEntry();
    await keychainEntry.deletePassword();
  } catch (cause) {
    if (isKeychainNotFoundError(cause)) {
      return;
    }
    if (options.strict) {
      throw cause;
    }
    // best effort in auto mode
  }
}

async function getFileToken(): Promise<null | TokenSet> {
  try {
    const raw = await readFile(filePath, "utf8");
    return parseTokenSet(raw);
  } catch (cause) {
    if (isErrnoException(cause) && cause.code === "ENOENT") {
      return null;
    }
    throw newRichError({
      cause,
      code: cliErrorCodes.CLI_TOKEN_STORE_READ_FAILED,
      details: {
        action: "ReadTokenSetFromFile",
        reason: "Failed to read file-based token state.",
      },
      isOperational: true,
      kind: "Internal",
      layer: "Presentation",
    });
  }
}

function getFreshnessScore(token: TokenSet): number {
  return typeof token.expires_at === "number" ? token.expires_at : 0;
}

function getKeychainEntry(): Promise<KeychainEntry> {
  if (!keychainEntryPromise) {
    keychainEntryPromise = loadKeychainEntry();
  }
  return keychainEntryPromise;
}

async function getKeychainToken(): Promise<KeychainReadResult> {
  try {
    const keychainEntry = await getKeychainEntry();
    const raw = await keychainEntry.getPassword();
    if (!raw) {
      return { available: true, token: null };
    }
    return {
      available: true,
      token: parseTokenSet(raw),
    };
  } catch (cause) {
    if (isKeychainNotFoundError(cause)) {
      return { available: true, token: null };
    }
    return { available: false, cause };
  }
}

function getTokenStoreBackend(): TokenStoreBackend {
  return tokenStoreBackendSchema.parse(process.env[tokenStoreBackendEnvName]);
}

function isErrnoException(value: unknown): value is NodeJS.ErrnoException {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof (value as { code?: unknown }).code === "string"
  );
}

function isFileFallbackAllowed(): boolean {
  return fileFallbackEnvSchema.parse(process.env[fileFallbackEnvName]) === "1";
}

function isKeychainNotFoundError(cause: unknown): boolean {
  if (!(cause instanceof Error)) {
    return false;
  }
  const message = cause.message.toLowerCase();
  return (
    message.includes("not found") ||
    message.includes("no matching") ||
    message.includes("does not exist")
  );
}

async function loadKeychainEntry(): Promise<KeychainEntry> {
  const { Entry } = await import("@napi-rs/keyring");
  return new Entry(SERVICE, ACCOUNT);
}

function newBackendUnavailableError(action: string, cause: unknown): RichError {
  return newRichError({
    cause,
    code: cliErrorCodes.CLI_TOKEN_STORE_BACKEND_UNAVAILABLE,
    details: {
      action,
      reason: keychainUnavailableReason,
    },
    isOperational: true,
    kind: "Internal",
    layer: "Presentation",
  });
}

function parseTokenSet(raw: string): null | TokenSet {
  try {
    const parsed = tokenSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return null;
    }

    return {
      access_token: parsed.data.access_token,
      ...(parsed.data.expires_at !== undefined
        ? { expires_at: parsed.data.expires_at }
        : {}),
      ...(parsed.data.refresh_token !== undefined
        ? { refresh_token: parsed.data.refresh_token }
        : {}),
      ...(parsed.data.scope !== undefined ? { scope: parsed.data.scope } : {}),
      ...(parsed.data.token_type !== undefined
        ? { token_type: parsed.data.token_type }
        : {}),
    };
  } catch {
    return null;
  }
}

async function persistTokenToFile(serialized: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, `${serialized}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });

  if (process.platform !== "win32") {
    try {
      await chmod(filePath, 0o600);
    } catch {
      // best effort
    }
  }
}

function selectTokenSource(
  keychainToken: null | TokenSet,
  fileToken: null | TokenSet,
): { source: "file" | "keychain"; token: TokenSet } | null {
  if (keychainToken && !fileToken) {
    return { source: "keychain", token: keychainToken };
  }
  if (!keychainToken && fileToken) {
    return { source: "file", token: fileToken };
  }
  if (!keychainToken || !fileToken) {
    return null;
  }

  const keychainFreshness = getFreshnessScore(keychainToken);
  const fileFreshness = getFreshnessScore(fileToken);
  if (fileFreshness > keychainFreshness) {
    return { source: "file", token: fileToken };
  }
  return { source: "keychain", token: keychainToken };
}

async function setKeychainToken(
  serialized: string,
): Promise<KeychainWriteResult> {
  return (async () => {
    try {
      const keychainEntry = await getKeychainEntry();
      await keychainEntry.setPassword(serialized);
      return { ok: true };
    } catch (cause) {
      return { cause, ok: false };
    }
  })();
}

function warnFileFallbackOnce(): void {
  if (didWarnFileFallback) return;
  didWarnFileFallback = true;
  console.warn(
    `Secure token storage is unavailable. Falling back to file token storage at ${filePath} because ${fileFallbackEnvName}=1.`,
  );
}
