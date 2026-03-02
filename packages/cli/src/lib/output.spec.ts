import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import {
  cliOutputSchemaVersion,
  printCliError,
  printSuccessData,
  printSuccessMessage,
} from "./output";

describe("lib/output", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints json success envelope with schemaVersion for data payload", () => {
    printSuccessData("tx.list", [{ id: "tx-1" }], "json", () => undefined);

    const [payload] = vi.mocked(console.log).mock.calls[0] ?? [];
    const parsed = JSON.parse(String(payload)) as {
      command: string;
      data: unknown;
      meta: { schemaVersion: string };
      ok: boolean;
    };

    expect(parsed).toEqual({
      command: "tx.list",
      data: [{ id: "tx-1" }],
      meta: {
        schemaVersion: cliOutputSchemaVersion,
      },
      ok: true,
    });
  });

  it("prints json success envelope with schemaVersion for message payload", () => {
    printSuccessMessage("auth.logout", "Logged out.", "json");

    const [payload] = vi.mocked(console.log).mock.calls[0] ?? [];
    const parsed = JSON.parse(String(payload)) as {
      command: string;
      message: string;
      meta: { schemaVersion: string };
      ok: boolean;
    };

    expect(parsed).toEqual({
      command: "auth.logout",
      message: "Logged out.",
      meta: {
        schemaVersion: cliOutputSchemaVersion,
      },
      ok: true,
    });
  });

  it("prints json error envelope with schemaVersion", () => {
    const error = newRichError({
      code: "CLI_COMMAND_INVALID_ARGUMENT",
      details: {
        action: "ParseCliArguments",
        reason: "tx delete requires --id",
      },
      isOperational: true,
      kind: "Validation",
      layer: "Presentation",
    });

    printCliError(error, "json");

    const [payload] = vi.mocked(console.error).mock.calls[0] ?? [];
    const parsed = JSON.parse(String(payload)) as {
      error: {
        code?: string;
        message: string;
      };
      meta: { schemaVersion: string };
      ok: boolean;
    };

    expect(parsed.ok).toBe(false);
    expect(parsed.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
    expect(parsed.error.message).toBe("tx delete requires --id");
    expect(parsed.meta.schemaVersion).toBe(cliOutputSchemaVersion);
  });
});
