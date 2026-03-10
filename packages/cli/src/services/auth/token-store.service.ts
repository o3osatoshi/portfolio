import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname } from "node:path";
import { join } from "node:path";

import { err, ok, ResultAsync } from "neverthrow";

import {
  deserialize,
  newRichError,
  omitUndefined,
  type RichError,
  serialize,
} from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import {
  resolveTokenStoreEnv,
  type TokenStoreEnv,
} from "../../common/runtime-env";
import { type OidcTokenSet, oidcTokenSetSchema } from "../../common/types";

const keychainServiceName = "o3o-cli";
const keychainAccountName = "default";
const fileFallbackEnvName = "O3O_ALLOW_FILE_TOKEN_STORE";
let didWarnFileFallback = false;

type KeychainEntry = {
  deletePassword(): MaybePromise<boolean | undefined>;
  getPassword(): MaybePromise<null | string | undefined>;
  setPassword(value: string): MaybePromise<void>;
};

type MaybePromise<T> = Promise<T> | T;
type TokenStoreBackend = TokenStoreEnv["tokenStoreBackend"];

export function clearTokenSet(): ResultAsync<void, RichError> {
  return resolveTokenStoreEnv().asyncAndThen((env) => {
    const tokenStoreFilePath = resolveTokenStoreFilePath(env);

    switch (env.tokenStoreBackend) {
      case "file": {
        return removeTokenStoreFile(tokenStoreFilePath);
      }

      case "keychain": {
        return deleteKeychainToken({
          action: "ClearTokenSet",
          backend: env.tokenStoreBackend,
          strict: true,
        });
      }

      case "auto": {
        return deleteKeychainToken({
          action: "ClearTokenSet",
          backend: env.tokenStoreBackend,
          strict: false,
        }).andThen(() =>
          removeTokenStoreFile(tokenStoreFilePath).orElse(() => ok(undefined)),
        );
      }
    }
  });
}

export function persistTokenSet(
  tokenSet: OidcTokenSet,
): ResultAsync<void, RichError> {
  return resolveTokenStoreEnv().asyncAndThen((env) =>
    serialize(tokenSet).asyncAndThen((serializedTokenSet) => {
      const tokenStoreFilePath = resolveTokenStoreFilePath(env);

      switch (env.tokenStoreBackend) {
        case "file": {
          return persistTokenToFile(serializedTokenSet, tokenStoreFilePath);
        }

        case "keychain": {
          return writeKeychainTokenSet(
            "PersistTokenSet",
            env.tokenStoreBackend,
            serializedTokenSet,
          ).andThen(() =>
            removeTokenStoreFile(tokenStoreFilePath).orElse(() =>
              ok(undefined),
            ),
          );
        }

        case "auto": {
          return writeKeychainTokenSet(
            "PersistTokenSet",
            env.tokenStoreBackend,
            serializedTokenSet,
          )
            .andThen(() =>
              removeTokenStoreFile(tokenStoreFilePath).orElse(() =>
                ok(undefined),
              ),
            )
            .orElse((error) => {
              if (!env.allowFileFallback) {
                return err(error);
              }

              return ok(undefined)
                .andTee(() => {
                  warnFileFallbackOnce(tokenStoreFilePath);
                })
                .asyncAndThen(() =>
                  persistTokenToFile(serializedTokenSet, tokenStoreFilePath),
                );
            });
        }
      }
    }),
  );
}

export function readTokenSet(): ResultAsync<null | OidcTokenSet, RichError> {
  return resolveTokenStoreEnv().asyncAndThen((env) => {
    const tokenStoreFilePath = resolveTokenStoreFilePath(env);

    switch (env.tokenStoreBackend) {
      case "file": {
        return readFileTokenSet(tokenStoreFilePath);
      }

      case "keychain": {
        return readKeychainTokenSet("ReadTokenSet", env.tokenStoreBackend);
      }

      case "auto": {
        return readTokenSetFromAutoBackend(env, tokenStoreFilePath);
      }
    }
  });
}

function buildKeychainUnavailableReason(backend: TokenStoreBackend): string {
  if (backend === "keychain") {
    return "Secure token storage (OS keychain) is unavailable. Set O3O_TOKEN_STORE_BACKEND=file to force file storage, or unset O3O_TOKEN_STORE_BACKEND and set O3O_ALLOW_FILE_TOKEN_STORE=1 to allow file fallback in auto mode.";
  }

  return "Secure token storage (OS keychain) is unavailable. Set O3O_ALLOW_FILE_TOKEN_STORE=1 only if you accept file-based token storage, or set O3O_TOKEN_STORE_BACKEND=file to force file storage.";
}

function deleteKeychainToken(options: {
  action: string;
  backend: TokenStoreBackend;
  strict: boolean;
}): ResultAsync<void, RichError> {
  return getKeychainEntry(options.action, options.backend)
    .andThen((keychainEntry) =>
      ResultAsync.fromPromise(
        Promise.resolve(keychainEntry.deletePassword()),
        (cause) => cause,
      ).orElse((cause) => {
        if (isKeychainNotFoundError(cause)) {
          return ok(undefined);
        }

        return err(
          newBackendUnavailableError(options.action, cause, options.backend),
        );
      }),
    )
    .map(() => undefined)
    .orElse((error) => {
      if (!options.strict) {
        return ok(undefined);
      }

      return err(error);
    });
}

function getFreshnessScore(token: OidcTokenSet): number {
  return typeof token.expires_at === "number" ? token.expires_at : 0;
}

function getKeychainEntry(
  action: string,
  backend: TokenStoreBackend,
): ResultAsync<KeychainEntry, RichError> {
  return ResultAsync.fromPromise(loadKeychainEntry(), (cause) =>
    newBackendUnavailableError(action, cause, backend),
  );
}

function isErrnoException(value: unknown): value is NodeJS.ErrnoException {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof (value as { code?: unknown }).code === "string"
  );
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
  return new Entry(keychainServiceName, keychainAccountName);
}

function migrateFileTokenToKeychain(
  tokenSet: OidcTokenSet,
  tokenStoreFilePath: string,
  allowFileFallback: boolean,
): ResultAsync<OidcTokenSet, RichError> {
  return serialize(tokenSet).asyncAndThen((serializedTokenSet) =>
    writeKeychainTokenSet("MigrateTokenStore", "auto", serializedTokenSet)
      .andThen(() =>
        removeTokenStoreFile(tokenStoreFilePath)
          .orElse(() => ok(undefined))
          .map(() => tokenSet),
      )
      .orElse((error) => {
        if (allowFileFallback) {
          return ok(tokenSet).andTee(() => {
            warnFileFallbackOnce(tokenStoreFilePath);
          });
        }

        return err(
          newRichError({
            cause: error,
            code: cliErrorCodes.CLI_TOKEN_STORE_MIGRATION_FAILED,
            details: {
              action: "MigrateTokenStore",
              reason:
                "Failed to migrate file-based token state to secure token storage.",
            },
            isOperational: true,
            kind: "Internal",
            layer: "Presentation",
          }),
        );
      }),
  );
}

function newBackendUnavailableError(
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

function parseStoredTokenSet(raw: string): null | OidcTokenSet {
  const deserialized = deserialize(raw);
  if (deserialized.isErr()) {
    return null;
  }

  const parsed = oidcTokenSetSchema.safeParse(deserialized.value);
  if (!parsed.success) {
    return null;
  }

  return omitUndefined({
    access_token: parsed.data.access_token,
    expires_at: parsed.data.expires_at,
    refresh_token: parsed.data.refresh_token,
    scope: parsed.data.scope,
    token_type: parsed.data.token_type,
  });
}

function persistTokenToFile(
  serialized: string,
  tokenStoreFilePath: string,
): ResultAsync<void, RichError> {
  return ResultAsync.fromPromise(
    (async () => {
      await mkdir(dirname(tokenStoreFilePath), { recursive: true });
      await writeFile(tokenStoreFilePath, `${serialized}\n`, {
        encoding: "utf8",
        mode: 0o600,
      });

      if (process.platform !== "win32") {
        try {
          await chmod(tokenStoreFilePath, 0o600);
        } catch {
          // best effort
        }
      }
    })(),
    (cause) =>
      newRichError({
        cause,
        code: cliErrorCodes.CLI_TOKEN_STORE_WRITE_FAILED,
        details: {
          action: "PersistTokenSetToFile",
          reason: "Failed to persist file-based token state.",
        },
        isOperational: true,
        kind: "Internal",
        layer: "Presentation",
      }),
  );
}

function readFileTokenSet(
  tokenStoreFilePath: string,
): ResultAsync<null | OidcTokenSet, RichError> {
  return ResultAsync.fromPromise(
    readFile(tokenStoreFilePath, "utf8"),
    (cause) => cause,
  )
    .orElse((cause) => {
      if (isErrnoException(cause) && cause.code === "ENOENT") {
        return ok(null);
      }

      return err(
        newRichError({
          cause,
          code: cliErrorCodes.CLI_TOKEN_STORE_READ_FAILED,
          details: {
            action: "ReadTokenSetFromFile",
            reason: "Failed to read file-based token state.",
          },
          isOperational: true,
          kind: "Internal",
          layer: "Presentation",
        }),
      );
    })
    .map((raw) => (typeof raw === "string" ? parseStoredTokenSet(raw) : null));
}

function readKeychainTokenSet(
  action: string,
  backend: TokenStoreBackend,
): ResultAsync<null | OidcTokenSet, RichError> {
  return getKeychainEntry(action, backend).andThen((keychainEntry) =>
    ResultAsync.fromPromise(
      Promise.resolve(keychainEntry.getPassword()),
      (cause) => cause,
    )
      .orElse((cause) => {
        if (isKeychainNotFoundError(cause)) {
          return ok(null);
        }

        return err(newBackendUnavailableError(action, cause, backend));
      })
      .map((raw) =>
        typeof raw === "string" && raw.length > 0
          ? parseStoredTokenSet(raw)
          : null,
      ),
  );
}

function readTokenSetFromAutoBackend(
  env: TokenStoreEnv,
  tokenStoreFilePath: string,
): ResultAsync<null | OidcTokenSet, RichError> {
  return readFileTokenSet(tokenStoreFilePath).andThen((fileToken) =>
    readKeychainTokenSet("ReadTokenSet", env.tokenStoreBackend)
      .andThen((keychainToken) => {
        const selected = selectTokenSource(keychainToken, fileToken);
        if (!selected) {
          return ok(null);
        }

        if (selected.source === "keychain") {
          return removeTokenStoreFile(tokenStoreFilePath)
            .orElse(() => ok(undefined))
            .map(() => selected.token);
        }

        return migrateFileTokenToKeychain(
          selected.token,
          tokenStoreFilePath,
          env.allowFileFallback,
        );
      })
      .orElse((error) => {
        if (!env.allowFileFallback) {
          return err(error);
        }

        if (!fileToken) {
          return ok(null);
        }

        return ok(fileToken).andTee(() => {
          warnFileFallbackOnce(tokenStoreFilePath);
        });
      }),
  );
}

function removeTokenStoreFile(
  tokenStoreFilePath: string,
): ResultAsync<void, RichError> {
  return ResultAsync.fromPromise(
    rm(tokenStoreFilePath, { force: true }),
    (cause) =>
      newRichError({
        cause,
        code: cliErrorCodes.CLI_TOKEN_STORE_CLEAR_FAILED,
        details: {
          action: "RemoveTokenStoreFile",
          reason: "Failed to remove file-based token state.",
        },
        isOperational: true,
        kind: "Internal",
        layer: "Presentation",
      }),
  );
}

function resolveTokenStoreFilePath(env: TokenStoreEnv): string {
  if (process.platform === "win32") {
    const basePath = env.appData ?? join(homedir(), "AppData", "Roaming");
    return join(basePath, "o3o", "auth.json");
  }

  if (env.xdgConfigHome) {
    return join(env.xdgConfigHome, "o3o", "auth.json");
  }

  return join(homedir(), ".config", "o3o", "auth.json");
}

function selectTokenSource(
  keychainToken: null | OidcTokenSet,
  fileToken: null | OidcTokenSet,
): { source: "file" | "keychain"; token: OidcTokenSet } | null {
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

function warnFileFallbackOnce(tokenStoreFilePath: string): void {
  if (didWarnFileFallback) return;
  didWarnFileFallback = true;
  console.warn(
    `Secure token storage is unavailable. Falling back to file token storage at ${tokenStoreFilePath} because ${fileFallbackEnvName}=1.`,
  );
}

function writeKeychainTokenSet(
  action: string,
  backend: TokenStoreBackend,
  serialized: string,
): ResultAsync<void, RichError> {
  return getKeychainEntry(action, backend).andThen((keychainEntry) =>
    ResultAsync.fromPromise(
      Promise.resolve(keychainEntry.setPassword(serialized)),
      (cause) => newBackendUnavailableError(action, cause, backend),
    ),
  );
}
