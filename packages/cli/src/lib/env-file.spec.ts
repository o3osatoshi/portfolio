import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { cliErrorCodes } from "./cli-error-catalog";
import { loadRuntimeEnvFile } from "./env-file";

describe("lib/env-file", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    delete process.env["O3O_API_BASE_URL"];
  });

  it("returns ok when path is not provided", async () => {
    const result = await loadRuntimeEnvFile();

    expect(result.isOk()).toBe(true);
  });

  it("loads env values from file for unset variables", async () => {
    const dir = await mkdtemp(join(tmpdir(), "o3o-env-file-"));
    const envFilePath = join(dir, ".env.local");

    await writeFile(
      envFilePath,
      "O3O_API_BASE_URL=https://from-file.example\n",
    );

    const result = await loadRuntimeEnvFile(envFilePath);

    expect(result.isOk()).toBe(true);
    expect(process.env["O3O_API_BASE_URL"]).toBe("https://from-file.example");

    await rm(dir, { force: true, recursive: true });
  });

  it("does not override existing env values", async () => {
    const dir = await mkdtemp(join(tmpdir(), "o3o-env-file-"));
    const envFilePath = join(dir, ".env.local");

    await writeFile(
      envFilePath,
      "O3O_API_BASE_URL=https://from-file.example\n",
    );
    vi.stubEnv("O3O_API_BASE_URL", "https://from-process-env.example");

    const result = await loadRuntimeEnvFile(envFilePath);

    expect(result.isOk()).toBe(true);
    expect(process.env["O3O_API_BASE_URL"]).toBe(
      "https://from-process-env.example",
    );

    await rm(dir, { force: true, recursive: true });
  });

  it("returns rich error when file loading fails", async () => {
    const result = await loadRuntimeEnvFile("/path/that/does/not/exist/.env");

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe(cliErrorCodes.CLI_ENV_FILE_LOAD_FAILED);
  });
});
