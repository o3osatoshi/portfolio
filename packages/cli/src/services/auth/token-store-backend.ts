import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { err, ok, okAsync, ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import type { OidcTokenSet } from "../../common/types";
import {
  isFileNotFoundError,
  isKeychainNotFoundError,
  type KeychainEntry,
  newBackendUnavailableError,
  parseTokenSet,
  type TokenStoreBackend,
} from "./token-store-support";

const keychainServiceName = "o3o-cli";
const keychainAccountName = "default";

export function deleteKeychainTokenSet(options: {
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
          return ok();
        }
        return err(
          newBackendUnavailableError(options.action, cause, options.backend),
        );
      }),
    )
    .map(() => undefined)
    .orElse((error) => {
      if (!options.strict) {
        return ok();
      }
      return err(error);
    });
}

export function persistTokenSetToFile(
  serializedTokenSet: string,
  tokenStoreFilePath: string,
): ResultAsync<void, RichError> {
  return ResultAsync.fromPromise(
    mkdir(dirname(tokenStoreFilePath), { recursive: true }),
    newPersistTokenSetToFileError,
  )
    .andThen(() =>
      ResultAsync.fromPromise(
        writeFile(tokenStoreFilePath, `${serializedTokenSet}\n`, {
          encoding: "utf8",
          mode: 0o600,
        }),
        newPersistTokenSetToFileError,
      ),
    )
    .andThen(() => {
      if (process.platform === "win32") {
        return okAsync(undefined);
      }
      return ResultAsync.fromPromise(
        chmod(tokenStoreFilePath, 0o600),
        newPersistTokenSetToFileError,
      )
        .orElse(() => okAsync(undefined))
        .map(() => undefined);
    });
}

export function persistTokenSetToKeychain(
  action: string,
  backend: TokenStoreBackend,
  serializedTokenSet: string,
): ResultAsync<void, RichError> {
  return getKeychainEntry(action, backend).andThen((keychainEntry) =>
    ResultAsync.fromPromise(
      Promise.resolve(keychainEntry.setPassword(serializedTokenSet)),
      (cause) => newBackendUnavailableError(action, cause, backend),
    ),
  );
}

export function readFileTokenSet(
  tokenStoreFilePath: string,
): ResultAsync<null | OidcTokenSet, RichError> {
  return ResultAsync.fromPromise(
    readFile(tokenStoreFilePath, "utf8"),
    (cause) => cause,
  )
    .orElse((cause) => {
      if (isFileNotFoundError(cause)) {
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
    .map((raw) => (typeof raw === "string" ? parseTokenSet(raw) : null));
}

export function readKeychainTokenSet(
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
      .map((raw) => (typeof raw === "string" ? parseTokenSet(raw) : null)),
  );
}

export function removeTokenSetFile(
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

function getKeychainEntry(
  action: string,
  backend: TokenStoreBackend,
): ResultAsync<KeychainEntry, RichError> {
  return ResultAsync.fromPromise(loadKeychainEntry(), (cause) =>
    newBackendUnavailableError(action, cause, backend),
  );
}

async function loadKeychainEntry(): Promise<KeychainEntry> {
  const { Entry } = await import("@napi-rs/keyring");
  return new Entry(keychainServiceName, keychainAccountName);
}

function newPersistTokenSetToFileError(cause: unknown): RichError {
  return newRichError({
    cause,
    code: cliErrorCodes.CLI_TOKEN_STORE_WRITE_FAILED,
    details: {
      action: "PersistTokenSetToFile",
      reason: "Failed to persist file-based token state.",
    },
    isOperational: true,
    kind: "Internal",
    layer: "Presentation",
  });
}
