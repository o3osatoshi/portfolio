import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { promisify } from "node:util";

import { z } from "zod";

import type { TokenSet } from "./types";

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

export async function clearTokenSet(): Promise<void> {
  await tryDeleteKeychain();
  await rm(filePath, { force: true });
}

export async function readTokenSet(): Promise<null | TokenSet> {
  const keychainValue = await tryReadKeychain();
  if (keychainValue) return keychainValue;

  if (!existsSync(filePath)) return null;
  const raw = await readFile(filePath, "utf8");
  return parseTokenSet(raw);
}

export async function writeTokenSet(tokenSet: TokenSet): Promise<void> {
  const parsed = tokenSchema.parse(tokenSet);
  const serialized = JSON.stringify(parsed);

  if (await tryWriteKeychain(serialized)) return;
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
}

function parseTokenSet(raw: string): null | TokenSet {
  try {
    const parsed = tokenSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function tryDeleteKeychain(): Promise<void> {
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
}

async function tryReadKeychain(): Promise<null | TokenSet> {
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
}

async function tryWriteKeychain(serialized: string): Promise<boolean> {
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
}

function warnFileFallbackOnce(): void {
  if (didWarnFileFallback) return;
  didWarnFileFallback = true;
  console.warn(
    `System keychain is unavailable. Falling back to file token storage at ${filePath}.`,
  );
}
