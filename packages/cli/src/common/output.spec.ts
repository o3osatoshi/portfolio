import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import {
  cliOutputVersion,
  printFailure,
  printSuccessData,
  printSuccessMessage,
} from "./output";

describe("common/output", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prints json success envelope for data payload", () => {
    printSuccessData("tx.list", [{ id: "tx-1" }], "json", () => undefined);

    const [payload] = vi.mocked(console.log).mock.calls[0] ?? [];
    const parsed = JSON.parse(String(payload)) as {
      command: string;
      meta: { version: number };
      ok: boolean;
      value: unknown;
    };

    expect(parsed).toEqual({
      command: "tx.list",
      meta: {
        version: cliOutputVersion,
      },
      ok: true,
      value: [{ id: "tx-1" }],
    });
  });

  it("prints json success envelope for message payload", () => {
    printSuccessMessage("auth.logout", "Logged out.", "json");

    const [payload] = vi.mocked(console.log).mock.calls[0] ?? [];
    const parsed = JSON.parse(String(payload)) as {
      command: string;
      message?: string;
      meta: { version: number };
      ok: boolean;
      value: unknown;
    };

    expect(parsed).toEqual({
      command: "auth.logout",
      message: "Logged out.",
      meta: {
        version: cliOutputVersion,
      },
      ok: true,
      value: null,
    });
  });

  it("prints json error envelope with version metadata", () => {
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

    printFailure(error, "json");

    const [payload] = vi.mocked(console.error).mock.calls[0] ?? [];
    const parsed = JSON.parse(String(payload)) as {
      error: {
        code?: string;
        message: string;
      };
      meta: { version: number };
      ok: boolean;
    };

    expect(parsed.ok).toBe(false);
    expect(parsed.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
    expect(parsed.error.message).toBe("tx delete requires --id");
    expect(parsed.meta.version).toBe(cliOutputVersion);
  });

  it("includes validation issues in json envelope only when debug is enabled", () => {
    const error = newRichError({
      code: "CLI_COMMAND_INVALID_ARGUMENT",
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
    });

    printFailure(error, "json");
    let [payload] = vi.mocked(console.error).mock.calls[0] ?? [];
    let parsed = JSON.parse(String(payload)) as {
      error: {
        issues?: unknown[];
      };
    };
    expect(parsed.error.issues).toBeUndefined();

    vi.mocked(console.error).mockClear();
    printFailure(error, "json", undefined, { debug: true });
    [payload] = vi.mocked(console.error).mock.calls[0] ?? [];
    parsed = JSON.parse(String(payload)) as {
      error: {
        issues?: unknown[];
      };
    };
    expect(parsed.error.issues).toEqual([
      {
        code: "too_small",
        message: "Too small string: min 1 (inclusive)",
        path: "currency",
      },
    ]);
  });
});
