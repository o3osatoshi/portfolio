import { homedir } from "node:os";
import { join } from "node:path";

import {
  deserialize,
  newRichError,
  omitUndefined,
  type RichError,
} from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import type { TokenStoreEnv } from "../../common/runtime-env";
import { type OidcTokenSet, oidcTokenSetSchema } from "../../common/types";

export const fileFallbackEnvName = "O3O_ALLOW_FILE_TOKEN_STORE";

export type KeychainEntry = {
  deletePassword(): MaybePromise<boolean | undefined>;
  getPassword(): MaybePromise<null | string | undefined>;
  setPassword(value: string): MaybePromise<void>;
};

export type MaybePromise<T> = Promise<T> | T;

export type TokenStoreBackend = TokenStoreEnv["tokenStoreBackend"];

export function isErrnoException(
  value: unknown,
): value is NodeJS.ErrnoException {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof (value as { code?: unknown }).code === "string"
  );
}

export function isFileNotFoundError(cause: unknown): boolean {
  return isErrnoException(cause) && cause.code === "ENOENT";
}

export function isKeychainNotFoundError(cause: unknown): boolean {
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

export function newBackendUnavailableError(
  action: string,
  cause: unknown,
  backend: TokenStoreBackend,
): RichError {
  return newRichError({
    cause,
    code: cliErrorCodes.CLI_TOKEN_STORE_BACKEND_UNAVAILABLE,
    details: {
      action,
      reason: buildKeychainUnavailableReason(backend),
    },
    isOperational: true,
    kind: "Internal",
    layer: "Presentation",
  });
}

export function parseTokenSet(tokenSet: string): null | OidcTokenSet {
  if (tokenSet.trim().length === 0) {
    return null;
  }

  const deserializedTokenSet = deserialize(tokenSet);
  if (deserializedTokenSet.isErr()) {
    return null;
  }

  const result = oidcTokenSetSchema.safeParse(deserializedTokenSet.value);
  if (!result.success) {
    return null;
  }

  return omitUndefined({
    access_token: result.data.access_token,
    expires_at: result.data.expires_at,
    refresh_token: result.data.refresh_token,
    scope: result.data.scope,
    token_type: result.data.token_type,
  });
}

export function resolveTokenStoreFilePath(env: TokenStoreEnv): string {
  if (process.platform === "win32") {
    const basePath = env.appData ?? join(homedir(), "AppData", "Roaming");
    return join(basePath, "o3o", "auth.json");
  }

  if (env.xdgConfigHome) {
    return join(env.xdgConfigHome, "o3o", "auth.json");
  }

  return join(homedir(), ".config", "o3o", "auth.json");
}

function buildKeychainUnavailableReason(backend: TokenStoreBackend): string {
  if (backend === "keychain") {
    return "Secure token storage (OS keychain) is unavailable. Set O3O_TOKEN_STORE_BACKEND=file to force file storage, or unset O3O_TOKEN_STORE_BACKEND and set O3O_ALLOW_FILE_TOKEN_STORE=1 to allow file fallback in auto mode.";
  }

  return "Secure token storage (OS keychain) is unavailable. Set O3O_ALLOW_FILE_TOKEN_STORE=1 only if you accept file-based token storage, or set O3O_TOKEN_STORE_BACKEND=file to force file storage.";
}
