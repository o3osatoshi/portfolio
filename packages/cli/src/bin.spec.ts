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
const originalStdinIsTty = process.stdin.isTTY;
const originalStdoutIsTty = process.stdout.isTTY;

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

    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalEnvFile === undefined) {
      delete process.env["O3O_ENV_FILE"];
    } else {
      process.env["O3O_ENV_FILE"] = originalEnvFile;
    }
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: originalStdinIsTty,
    });
    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: originalStdoutIsTty,
    });
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
    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto", "text");
  });

  it("loads env file from --env-file", async () => {
    await runBin(["--env-file", ".env.local", "auth", "login"]);

    expect(h.loadRuntimeEnvFileMock).toHaveBeenCalledWith(".env.local");
    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto", "text");
  });

  it("loads env file from --env-file=<path>", async () => {
    await runBin(["--env-file=.env.local", "auth", "login"]);

    expect(h.loadRuntimeEnvFileMock).toHaveBeenCalledWith(".env.local");
    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto", "text");
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

    expect(h.runAuthLoginMock).toHaveBeenCalledWith("pkce", "text");
  });

  it("passes json flag to tx list", async () => {
    await runBin(["tx", "list", "--json"]);

    expect(h.runTxListMock).toHaveBeenCalledWith(true, "text");
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

    expect(h.runTxCreateMock).toHaveBeenCalledWith(
      {
        amount: "1",
        currency: "USD",
        datetime: "2026-01-01T00:00:00.000Z",
        fee: "0.1",
        feeCurrency: undefined,
        price: "100",
        profitLoss: undefined,
        type: "BUY",
      },
      "text",
    );
  });

  it("fails tx create when required arguments are missing", async () => {
    await runBin(["tx", "create", "--type", "BUY"]);

    expect(h.runTxCreateMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "tx create requires --type --datetime --amount --price --currency (code=CLI_COMMAND_INVALID_ARGUMENT)",
    );
    expect(process.exitCode).toBe(2);
  });

  it("fails tx update when id is missing", async () => {
    await runBin(["tx", "update", "--type", "BUY"]);

    expect(h.runTxUpdateMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "tx update requires --id (code=CLI_COMMAND_INVALID_ARGUMENT)",
    );
    expect(process.exitCode).toBe(2);
  });

  it("fails tx delete when id is missing", async () => {
    await runBin(["tx", "delete"]);

    expect(h.runTxDeleteMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "tx delete requires --id (code=CLI_COMMAND_INVALID_ARGUMENT)",
    );
    expect(process.exitCode).toBe(2);
  });

  it("fails unknown commands with a validation error", async () => {
    await runBin(["unknown"]);

    expect(console.error).toHaveBeenCalledWith(
      "Unknown command: unknown. Run `o3o help`. (code=CLI_COMMAND_INVALID_ARGUMENT)",
    );
    expect(process.exitCode).toBe(2);
  });

  it("fails when --env-file value is missing", async () => {
    await runBin(["--env-file"]);

    expect(h.loadRuntimeEnvFileMock).not.toHaveBeenCalled();
    expect(h.runAuthLoginMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      "--env-file requires a non-empty path value (code=CLI_COMMAND_INVALID_ARGUMENT)",
    );
    expect(process.exitCode).toBe(2);
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
    expect(process.exitCode).toBe(6);
  });

  it("passes json output mode to commands", async () => {
    await runBin(["--output", "json", "auth", "login"]);

    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto", "json");
  });

  it("supports --output=<mode>", async () => {
    await runBin(["--output=json", "tx", "list"]);

    expect(h.runTxListMock).toHaveBeenCalledWith(false, "json");
  });

  it("resolves --output auto to json on non-TTY", async () => {
    Object.defineProperty(process.stdin, "isTTY", {
      configurable: true,
      value: false,
    });
    Object.defineProperty(process.stdout, "isTTY", {
      configurable: true,
      value: false,
    });

    await runBin(["auth", "login"]);

    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto", "json");
  });

  it("supports --output=auto and resolves to text on TTY", async () => {
    await runBin(["--output=auto", "tx", "list"]);

    expect(h.runTxListMock).toHaveBeenCalledWith(false, "text");
  });

  it("prints help as machine-readable json in output=json mode", async () => {
    await runBin(["--output", "json", "help"]);

    expect(console.log).toHaveBeenCalledTimes(1);
    const [payload] = vi.mocked(console.log).mock.calls[0] ?? [];
    expect(typeof payload).toBe("string");
    const parsed = JSON.parse(String(payload)) as {
      command: string;
      data: {
        commands: string[];
      };
      meta: {
        schemaVersion: string;
      };
      ok: boolean;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.command).toBe("help");
    expect(parsed.meta.schemaVersion).toBe("v1");
    expect(parsed.data.commands).toContain("o3o tx delete --id <id> [--yes]");
  });

  it("prints structured json error when output=json and command is invalid", async () => {
    await runBin(["--output", "json", "unknown"]);

    expect(console.error).toHaveBeenCalledTimes(1);
    const [payload] = vi.mocked(console.error).mock.calls[0] ?? [];
    expect(typeof payload).toBe("string");
    const parsed = JSON.parse(String(payload)) as {
      error: { code?: string; reason?: string };
      meta?: { schemaVersion: string };
      ok: boolean;
    };
    expect(parsed.ok).toBe(false);
    expect(parsed.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
    expect(parsed.error.reason).toBe(
      "Unknown command: unknown. Run `o3o help`.",
    );
    expect(parsed.meta?.schemaVersion).toBe("v1");
    expect(process.exitCode).toBe(2);
  });
});
