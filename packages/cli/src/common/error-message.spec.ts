import { describe, expect, it } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import { toCliErrorMessage, toCliErrorPayload } from "./error-message";

describe("common/error-message", () => {
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

  it("prints debug details block in text output when validation issues exist", () => {
    const error = newRichError({
      code: "CLI_COMMAND_INVALID_ARGUMENT",
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
    });

    expect(toCliErrorMessage(error, { debug: true })).toBe(
      [
        "Invalid tx update arguments: currency: Too small string: min 1 (inclusive) (code=CLI_COMMAND_INVALID_ARGUMENT)",
        "Details:",
        "- currency: Too small string: min 1 (inclusive) (code=too_small)",
        "Try: Use `o3o tx update --help` to review accepted options.",
      ].join("\n"),
    );
  });

  it("includes validation issues in json payload only when debug is enabled", () => {
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

    expect(toCliErrorPayload(error).error.issues).toBeUndefined();
    expect(toCliErrorPayload(error, { debug: true }).error.issues).toEqual([
      {
        code: "too_small",
        message: "Too small string: min 1 (inclusive)",
        path: "currency",
      },
    ]);
  });
});
