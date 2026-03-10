import { err, ok, type ResultAsync } from "neverthrow";

import { newRichError, type RichError, serialize } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import {
  resolveTokenStoreEnv,
  type TokenStoreEnv,
} from "../../common/runtime-env";
import type { OidcTokenSet } from "../../common/types";
import {
  deleteKeychainToken,
  persistTokenToFile,
  readFileTokenSet,
  readKeychainTokenSet,
  removeTokenStoreFile,
  writeKeychainTokenSet,
} from "./token-store-backend";
import {
  fileFallbackEnvName,
  resolveTokenStoreFilePath,
} from "./token-store-support";

let didWarnFileFallback = false;

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

function getFreshnessScore(token: OidcTokenSet): number {
  return typeof token.expires_at === "number" ? token.expires_at : 0;
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
