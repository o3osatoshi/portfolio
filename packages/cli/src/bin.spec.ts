import { errAsync, okAsync } from "neverthrow";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./common/error-catalog";

const h = vi.hoisted(() => ({
  loadRuntimeEnvFileMock: vi.fn(),
  runAuthLoginMock: vi.fn(),
  runAuthLogoutMock: vi.fn(),
  runAuthWhoamiMock: vi.fn(),
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

vi.mock("./common/env-file", () => ({
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

  it("uses auto mode for auth login by default", async () => {
    await runBin(["auth", "login"]);

    expect(h.loadRuntimeEnvFileMock).toHaveBeenCalledWith(undefined);
    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto", "text");
  });

  it("passes explicit login mode", async () => {
    await runBin(["auth", "login", "--mode", "device"]);

    expect(h.runAuthLoginMock).toHaveBeenCalledWith("device", "text");
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

  it("trims --env-file value before loading", async () => {
    await runBin(["--env-file", ".env.local ", "auth", "login"]);

    expect(h.loadRuntimeEnvFileMock).toHaveBeenCalledWith(".env.local");
    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto", "text");
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

  it("dispatches tx list without legacy --json flag", async () => {
    await runBin(["tx", "list"]);

    expect(h.runTxListMock).toHaveBeenCalledWith("text");
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

  it("fails tx update when id is missing", async () => {
    await runBin(["tx", "update", "--type", "BUY"]);

    expect(h.runTxUpdateMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("required option '--id <id>' not specified"),
    );
    expect(process.exitCode).toBe(2);
  });

  it("fails tx delete when id is missing", async () => {
    await runBin(["tx", "delete"]);

    expect(h.runTxDeleteMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("required option '--id <id>' not specified"),
    );
    expect(process.exitCode).toBe(2);
  });

  it("fails when --env-file value is missing", async () => {
    await runBin(["--env-file"]);

    expect(h.loadRuntimeEnvFileMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("option '--env-file <path>' argument missing"),
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

  it("maps unexpected command runtime errors to internal CLI errors", async () => {
    h.runAuthLoginMock.mockReturnValueOnce(
      errAsync(new Error("boom") as never),
    );

    await runBin(["auth", "login"]);

    expect(console.error).toHaveBeenCalledWith(
      "boom (code=CLI_INTERNAL_ERROR)",
    );
    expect(process.exitCode).toBe(1);
  });

  it("passes json output mode to commands", async () => {
    await runBin(["--output", "json", "auth", "login"]);

    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto", "json");
  });

  it("passes debug flag without changing command dispatch", async () => {
    await runBin(["--debug", "auth", "login"]);

    expect(h.runAuthLoginMock).toHaveBeenCalledWith("auto", "text");
  });

  it("supports --output=<mode>", async () => {
    await runBin(["--output=json", "tx", "list"]);

    expect(h.runTxListMock).toHaveBeenCalledWith("json");
  });

  it("resolves default output mode to json on non-TTY", async () => {
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

  it("rejects deprecated --output auto", async () => {
    await runBin(["--output=auto", "tx", "list"]);

    expect(h.runTxListMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("Allowed choices are text, json"),
    );
    expect(process.exitCode).toBe(2);
  });

  it("rejects removed auth login flags", async () => {
    await runBin(["auth", "login", "--pkce"]);

    expect(h.runAuthLoginMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("unknown option '--pkce'"),
    );
    expect(process.exitCode).toBe(2);
  });

  it("rejects removed tx list --json flag", async () => {
    await runBin(["tx", "list", "--json"]);

    expect(h.runTxListMock).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("unknown option '--json'"),
    );
    expect(process.exitCode).toBe(2);
  });

  it("prints structured json error when output=json and command is invalid", async () => {
    await runBin(["--output", "json", "unknown"]);

    expect(console.error).toHaveBeenCalledTimes(1);
    const [payload] = vi.mocked(console.error).mock.calls[0] ?? [];
    expect(typeof payload).toBe("string");
    const parsed = JSON.parse(String(payload)) as {
      error: { code?: string; reason?: string };
      meta?: { version: number };
      ok: boolean;
    };
    expect(parsed.ok).toBe(false);
    expect(parsed.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
    expect(parsed.error.reason).toContain("unknown command");
    expect(parsed.meta?.version).toBe(1);
    expect(process.exitCode).toBe(2);
  });

  it("includes validation issues in json error when --debug is enabled", async () => {
    h.runTxUpdateMock.mockReturnValueOnce(
      errAsync(
        newRichError({
          code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
          details: {
            action: "ParseTxUpdateArguments",
            hint: "Use `o3o tx update --help` to review accepted options.",
            reason:
              "Invalid tx update arguments: currency: Too small string: min 1 (inclusive)",
          },
          isOperational: true,
          kind: "Validation",
          layer: "Presentation",
          meta: {
            validationIssues: [
              {
                code: "too_small",
                message: "Too small string: min 1 (inclusive)",
                path: "currency",
              },
            ],
          },
        }),
      ),
    );

    await runBin([
      "--output",
      "json",
      "--debug",
      "tx",
      "update",
      "--id",
      "tx-1",
      "--currency",
      "",
    ]);

    expect(console.error).toHaveBeenCalledTimes(1);
    const [payload] = vi.mocked(console.error).mock.calls[0] ?? [];
    expect(typeof payload).toBe("string");
    const parsed = JSON.parse(String(payload)) as {
      error: { issues?: unknown[] };
      ok: boolean;
    };
    expect(parsed.ok).toBe(false);
    expect(parsed.error.issues).toEqual([
      {
        code: "too_small",
        message: "Too small string: min 1 (inclusive)",
        path: "currency",
      },
    ]);
    expect(process.exitCode).toBe(2);
  });

  it("keeps json error contract unchanged when --debug is not enabled", async () => {
    h.runTxUpdateMock.mockReturnValueOnce(
      errAsync(
        newRichError({
          code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
          details: {
            action: "ParseTxUpdateArguments",
            reason:
              "Invalid tx update arguments: currency: Too small string: min 1 (inclusive)",
          },
          isOperational: true,
          kind: "Validation",
          layer: "Presentation",
          meta: {
            validationIssues: [
              {
                code: "too_small",
                message: "Too small string: min 1 (inclusive)",
                path: "currency",
              },
            ],
          },
        }),
      ),
    );

    await runBin([
      "--output",
      "json",
      "tx",
      "update",
      "--id",
      "tx-1",
      "--currency",
      "",
    ]);

    expect(console.error).toHaveBeenCalledTimes(1);
    const [payload] = vi.mocked(console.error).mock.calls[0] ?? [];
    expect(typeof payload).toBe("string");
    const parsed = JSON.parse(String(payload)) as {
      error: { issues?: unknown[] };
      ok: boolean;
    };
    expect(parsed.ok).toBe(false);
    expect(parsed.error.issues).toBeUndefined();
    expect(process.exitCode).toBe(2);
  });
});
