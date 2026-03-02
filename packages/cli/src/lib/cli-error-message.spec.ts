import { describe, expect, it } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import { toCliErrorMessage, toCliErrorPayload } from "./cli-error-message";

describe("lib/cli-error-message", () => {
  it("adds (code=...) suffix in text messages", () => {
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

    expect(toCliErrorMessage(error)).toBe(
      "tx delete requires --id (code=CLI_COMMAND_INVALID_ARGUMENT)",
    );
  });

  it("keeps json payload message short without code suffix", () => {
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

    expect(toCliErrorPayload(error)).toEqual({
      error: {
        action: "ParseCliArguments",
        code: "CLI_COMMAND_INVALID_ARGUMENT",
        kind: "Validation",
        layer: "Presentation",
        message: "tx delete requires --id",
        reason: "tx delete requires --id",
      },
      ok: false,
    });
  });
});
