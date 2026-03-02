import { describe, expect, it } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./cli-error-catalog";
import { resolveCliExitCode } from "./exit-code";

describe("lib/exit-code", () => {
  it("maps validation/usage errors to 2", () => {
    const error = newRichError({
      code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
      isOperational: true,
      kind: "Validation",
      layer: "Presentation",
    });

    expect(resolveCliExitCode(error)).toBe(2);
  });

  it("maps unauthorized errors to 3", () => {
    const error = newRichError({
      code: cliErrorCodes.CLI_API_UNAUTHORIZED,
      isOperational: true,
      kind: "Unauthorized",
      layer: "Presentation",
    });

    expect(resolveCliExitCode(error)).toBe(3);
  });

  it("maps forbidden errors to 4", () => {
    const error = newRichError({
      code: cliErrorCodes.CLI_SCOPE_FORBIDDEN,
      isOperational: true,
      kind: "Forbidden",
      layer: "Presentation",
    });

    expect(resolveCliExitCode(error)).toBe(4);
  });

  it("maps api/network errors to 5", () => {
    const error = newRichError({
      code: cliErrorCodes.CLI_API_REQUEST_FAILED,
      isOperational: true,
      kind: "BadGateway",
      layer: "Presentation",
    });

    expect(resolveCliExitCode(error)).toBe(5);
  });

  it("maps local runtime errors to 6", () => {
    const error = newRichError({
      code: cliErrorCodes.CLI_TOKEN_STORE_READ_FAILED,
      isOperational: true,
      kind: "Internal",
      layer: "Presentation",
    });

    expect(resolveCliExitCode(error)).toBe(6);
  });

  it("maps prompt read errors to 6", () => {
    const error = newRichError({
      code: cliErrorCodes.CLI_PROMPT_READ_FAILED,
      isOperational: true,
      kind: "Internal",
      layer: "Presentation",
    });

    expect(resolveCliExitCode(error)).toBe(6);
  });

  it("falls back to 1 for uncategorized errors", () => {
    const error = newRichError({
      isOperational: true,
      kind: "Internal",
      layer: "Presentation",
    });

    expect(resolveCliExitCode(error)).toBe(1);
  });
});
