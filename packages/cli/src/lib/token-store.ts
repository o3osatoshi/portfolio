import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

import { Entry } from "@napi-rs/keyring";
import { errAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import { newRichError, type RichError, toRichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./cli-error-catalog";
import type { TokenSet } from "./types";

const tokenSchema = z.object({
  access_token: z.string().min(1),
  expires_at: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: z.string().optional(),
});

const SERVICE = "o3o-cli";
const ACCOUNT = "default";
const filePath = join(homedir(), ".config", "o3o", "auth.json");
const fileFallbackEnvName = "O3O_ALLOW_FILE_TOKEN_STORE";
const keychainEntry = new Entry(SERVICE, ACCOUNT);
let didWarnFileFallback = false;
const keychainUnavailableReason =
  "Secure token storage (OS keychain) is unavailable. Set O3O_ALLOW_FILE_TOKEN_STORE=1 only if you accept file-based token storage.";

type KeychainReadResult =
  | { available: false; cause: unknown }
  | { available: true; token: null | TokenSet };

type KeychainWriteResult = { cause: unknown; ok: false } | { ok: true };

export function clearTokenSet(): ResultAsync<void, RichError> {
  return ResultAsync.fromPromise(
    (async () => {
      await deleteKeychainToken();
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
  return ResultAsync.fromPromise(
    (async () => {
      const keychainResult = await getKeychainToken();
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
  const parsed = tokenSchema.safeParse(tokenSet);
  if (!parsed.success) {
    return errAsync(
      newRichError({
        cause: parsed.error,
        code: cliErrorCodes.CLI_TOKEN_STORE_WRITE_FAILED,
        details: {
          action: "WriteTokenSet",
          reason: "Token payload is invalid.",
        },
        isOperational: true,
        kind: "Validation",
        layer: "Presentation",
      }),
    );
  }

  const serialized = JSON.stringify(parsed.data);
  return ResultAsync.fromPromise(
    (async () => {
      const keychainWrite = await setKeychainToken(serialized);
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

async function deleteKeychainToken(): Promise<void> {
  try {
    await keychainEntry.deletePassword();
  } catch (cause) {
    if (isKeychainNotFoundError(cause)) {
      return;
    }
    // best effort
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

async function getKeychainToken(): Promise<KeychainReadResult> {
  try {
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

function isErrnoException(value: unknown): value is NodeJS.ErrnoException {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof (value as { code?: unknown }).code === "string"
  );
}

function isFileFallbackAllowed(): boolean {
  return process.env[fileFallbackEnvName] === "1";
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
    return parsed.success ? parsed.data : null;
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
