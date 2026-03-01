import { errAsync, okAsync } from "neverthrow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./lib/cli-error-catalog";

const h = vi.hoisted(() => ({
  loadRuntimeEnvFileMock: vi.fn(),
  runAuthLoginMock: vi.fn(),
  runAuthLogoutMock: vi.fn(),
  runAuthWhoamiMock: vi.fn(),
  runHelloMock: vi.fn(),
  runTxCreateMock: vi.fn(),
  runTxDeleteMock: vi.fn(),
  runTxListMock: vi.fn(),
  runTxUpdateMock: vi.fn(),
}));

vi.mock("./commands/auth/login", () => ({
  runAuthLogin: h.runAuthLoginMock,
}));

vi.mock("./commands/auth/logout", () => ({
  runAuthLogout: h.runAuthLogoutMock,
}));

vi.mock("./commands/auth/whoami", () => ({
  runAuthWhoami: h.runAuthWhoamiMock,
}));

vi.mock("./commands/hello", () => ({
  runHello: h.runHelloMock,
}));

vi.mock("./commands/tx/create", () => ({
  runTxCreate: h.runTxCreateMock,
}));

vi.mock("./commands/tx/delete", () => ({
  runTxDelete: h.runTxDeleteMock,
}));

vi.mock("./commands/tx/list", () => ({
  runTxList: h.runTxListMock,
}));

vi.mock("./commands/tx/update", () => ({
  runTxUpdate: h.runTxUpdateMock,
}));

vi.mock("./lib/env-file", () => ({
  loadRuntimeEnvFile: h.loadRuntimeEnvFileMock,
}));

const originalArgv = [...process.argv];
const originalExitCode = process.exitCode;
const originalEnvFile = process.env["O3O_ENV_FILE"];

async function runBin(args: string[]): Promise<void> {
  vi.resetModules();
  process.exitCode = undefined;
  process.argv = ["node", "o3o", ...args];

  await import("./bin");
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("bin", () => {
  beforeEach(() => {
    h.loadRuntimeEnvFileMock.mockReset().mockReturnValue(okAsync(undefined));
    h.runAuthLoginMock.mockReset().mockReturnValue(okAsync(undefined));
    h.runAuthLogoutMock.mockReset().mockReturnValue(okAsync(undefined));
    h.runAuthWhoamiMock.mockReset().mockReturnValue(okAsync(undefined));
    h.runHelloMock.mockReset().mockReturnValue(okAsync(undefined));
    h.runTxCreateMock.mockReset().mockReturnValue(okAsync(undefined));
    h.runTxDeleteMock.mockReset().mockReturnValue(okAsync(undefined));
    h.runTxListMock.mockReset().mockReturnValue(okAsync(undefined));
    h.runTxUpdateMock.mockReset().mockReturnValue(okAsync(undefined));
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalEnvFile === undefined) {
      delete process.env["O3O_ENV_FILE"];
    } else {
      process.env["O3O_ENV_FILE"] = originalEnvFile;
    }
    process.argv = [...originalArgv];
    process.exitCode = originalExitCode;
  });

  it("dispatches hello command", async () => {
    await runBin(["hello"]);

    expect(h.runHelloMock).toHaveBeenCalledTimes(1);
    expect(process.exitCode).toBeUndefined();
  });

  it("uses auto mode for auth login by default", async () => {
    await runBin(["auth", "login"]);

    expect(h.loadRuntimeEnvFileMock).toHaveBeenCalledWith(undefined);
    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto");
  });

  it("loads env file from --env-file", async () => {
    await runBin(["--env-file", ".env.local", "auth", "login"]);

    expect(h.loadRuntimeEnvFileMock).toHaveBeenCalledWith(".env.local");
    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto");
  });

  it("loads env file from --env-file=<path>", async () => {
    await runBin(["--env-file=.env.local", "auth", "login"]);

    expect(h.loadRuntimeEnvFileMock).toHaveBeenCalledWith(".env.local");
    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto");
  });

  it("uses last env-file value when repeated", async () => {
    await runBin(["--env-file=.env.a", "--env-file=.env.b", "auth", "login"]);

    expect(h.loadRuntimeEnvFileMock).toHaveBeenCalledWith(".env.b");
  });

  it("uses O3O_ENV_FILE when --env-file is not provided", async () => {
    process.env["O3O_ENV_FILE"] = ".env.from-env-var";

    await runBin(["auth", "login"]);

    expect(h.loadRuntimeEnvFileMock).toHaveBeenCalledWith(".env.from-env-var");
  });

  it("prioritizes --env-file over O3O_ENV_FILE", async () => {
    process.env["O3O_ENV_FILE"] = ".env.from-env-var";

    await runBin(["--env-file", ".env.from-flag", "auth", "login"]);

    expect(h.loadRuntimeEnvFileMock).toHaveBeenCalledWith(".env.from-flag");
  });

  it("prioritizes pkce flag over device flag when both are present", async () => {
    await runBin(["auth", "login", "--pkce", "--device"]);

    expect(h.runAuthLoginMock).toHaveBeenCalledWith("pkce");
  });

  it("passes json flag to tx list", async () => {
    await runBin(["tx", "list", "--json"]);

    expect(h.runTxListMock).toHaveBeenCalledWith(true);
  });

  it("passes parsed payload to tx create", async () => {
    await runBin([
      "tx",
      "create",
      "--type",
      "BUY",
      "--datetime",
      "2026-01-01T00:00:00.000Z",
      "--amount",
      "1",
      "--price",
      "100",
      "--currency",
      "USD",
      "--fee",
      "0.1",
    ]);

    expect(h.runTxCreateMock).toHaveBeenCalledWith({
      amount: "1",
      currency: "USD",
      datetime: "2026-01-01T00:00:00.000Z",
      fee: "0.1",
      feeCurrency: undefined,
      price: "100",
      profitLoss: undefined,
      type: "BUY",
    });
  });

  it("fails tx create when required arguments are missing", async () => {
    await runBin(["tx", "create", "--type", "BUY"]);

    expect(h.runTxCreateMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "tx create requires --type --datetime --amount --price --currency (code=CLI_COMMAND_INVALID_ARGUMENT)",
    );
    expect(process.exitCode).toBe(1);
  });

  it("fails tx update when id is missing", async () => {
    await runBin(["tx", "update", "--type", "BUY"]);

    expect(h.runTxUpdateMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "tx update requires --id (code=CLI_COMMAND_INVALID_ARGUMENT)",
    );
    expect(process.exitCode).toBe(1);
  });

  it("fails tx delete when id is missing", async () => {
    await runBin(["tx", "delete"]);

    expect(h.runTxDeleteMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "tx delete requires --id (code=CLI_COMMAND_INVALID_ARGUMENT)",
    );
    expect(process.exitCode).toBe(1);
  });

  it("prints help for unknown commands", async () => {
    await runBin(["unknown"]);

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Usage:"));
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("--fee-currency"),
    );
  });

  it("fails when --env-file value is missing", async () => {
    await runBin(["--env-file"]);

    expect(h.loadRuntimeEnvFileMock).not.toHaveBeenCalled();
    expect(h.runAuthLoginMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "--env-file requires a non-empty path value (code=CLI_COMMAND_INVALID_ARGUMENT)",
    );
    expect(process.exitCode).toBe(1);
  });

  it("fails when env-file loading fails", async () => {
    h.loadRuntimeEnvFileMock.mockReturnValueOnce(
      errAsync(
        newRichError({
          code: cliErrorCodes.CLI_ENV_FILE_LOAD_FAILED,
          details: {
            action: "LoadCliRuntimeEnvFile",
            reason: "Failed to load env file: .env.local",
          },
          isOperational: true,
          kind: "Validation",
          layer: "Presentation",
        }),
      ),
    );

    await runBin(["--env-file", ".env.local", "auth", "login"]);

    expect(h.runAuthLoginMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "Failed to load env file: .env.local (code=CLI_ENV_FILE_LOAD_FAILED)",
    );
    expect(process.exitCode).toBe(1);
  });
});
