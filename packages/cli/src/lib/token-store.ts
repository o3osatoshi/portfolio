import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import { newRichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./cli-error-catalog";
import type { CliResultAsync, TokenSet } from "./types";

const execFileAsync = promisify(execFile);

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
let didWarnFileFallback = false;

export function clearTokenSet(): CliResultAsync<void> {
  return ResultAsync.fromPromise(
    (async () => {
      await tryDeleteKeychain();
      await rm(filePath, { force: true });
    })(),
    (cause) =>
      newRichError({
        cause,
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

export function readTokenSet(): CliResultAsync<null | TokenSet> {
  return tryReadKeychain().andThen((keychainValue) => {
    if (keychainValue) return okAsync(keychainValue);
    if (!existsSync(filePath)) return okAsync(null);

    return ResultAsync.fromPromise(readFile(filePath, "utf8"), (cause) =>
      newRichError({
        cause,
        code: cliErrorCodes.CLI_TOKEN_STORE_READ_FAILED,
        details: {
          action: "ReadTokenSet",
          reason: "Failed to read local token state.",
        },
        isOperational: true,
        kind: "Internal",
        layer: "Presentation",
      }),
    ).map((raw) => parseTokenSet(raw));
  });
}

export function writeTokenSet(tokenSet: TokenSet): CliResultAsync<void> {
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
      if (await tryWriteKeychain(serialized)) {
        return;
      }

      warnFileFallbackOnce();

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
    })(),
    (cause) =>
      newRichError({
        cause,
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

function parseTokenSet(raw: string): null | TokenSet {
  try {
    const parsed = tokenSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function tryDeleteKeychain(): Promise<void> {
  return (async () => {
    try {
      if (process.platform === "darwin") {
        await execFileAsync("security", [
          "delete-generic-password",
          "-a",
          ACCOUNT,
          "-s",
          SERVICE,
        ]);
        return;
      }

      if (process.platform === "linux") {
        await execFileAsync("secret-tool", [
          "clear",
          "service",
          SERVICE,
          "account",
          ACCOUNT,
        ]);
      }
    } catch {
      // no-op
    }
  })();
}

function tryReadKeychain(): CliResultAsync<null | TokenSet> {
  return ResultAsync.fromPromise(
    (async () => {
      try {
        if (process.platform === "darwin") {
          const { stdout } = await execFileAsync("security", [
            "find-generic-password",
            "-a",
            ACCOUNT,
            "-s",
            SERVICE,
            "-w",
          ]);
          return parseTokenSet(stdout);
        }

        if (process.platform === "linux") {
          const { stdout } = await execFileAsync("secret-tool", [
            "lookup",
            "service",
            SERVICE,
            "account",
            ACCOUNT,
          ]);
          if (!stdout.trim()) return null;
          return parseTokenSet(stdout);
        }

        return null;
      } catch {
        return null;
      }
    })(),
    (cause) =>
      newRichError({
        cause,
        code: cliErrorCodes.CLI_TOKEN_STORE_READ_FAILED,
        details: {
          action: "ReadTokenSetFromKeychain",
          reason: "Failed to read token from system keychain.",
        },
        isOperational: true,
        kind: "Internal",
        layer: "Presentation",
      }),
  );
}

function tryWriteKeychain(serialized: string): Promise<boolean> {
  return (async () => {
    try {
      if (process.platform === "darwin") {
        await execFileAsync("security", [
          "add-generic-password",
          "-U",
          "-a",
          ACCOUNT,
          "-s",
          SERVICE,
          "-w",
          serialized,
        ]);
        return true;
      }

      if (process.platform === "linux") {
        // Avoid hard dependency on secret-tool stdin behavior; fall back to file.
        return false;
      }

      return false;
    } catch {
      return false;
    }
  })();
}

function warnFileFallbackOnce(): void {
  if (didWarnFileFallback) return;
  didWarnFileFallback = true;
  console.warn(
    `System keychain is unavailable. Falling back to file token storage at ${filePath}.`,
  );
}
