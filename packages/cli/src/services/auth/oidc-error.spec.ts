import { describe, expect, it } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import { remapOidcError, toReason } from "./oidc-error";

describe("services/auth/oidc-error", () => {
  it("returns the same error when remap target already matches", () => {
    const cause = newRichError({
      code: "CLI_AUTH_LOGIN_FAILED",
      details: {
        action: "AuthenticateWithOidc",
        reason: "OIDC login failed.",
      },
      isOperational: true,
      kind: "Unauthorized",
      layer: "Presentation",
    });

    const remapped = remapOidcError(cause, {
      action: "AuthenticateWithOidc",
      code: "CLI_AUTH_LOGIN_FAILED",
      kind: "Unauthorized",
      reason: "OIDC login failed.",
    });

    expect(remapped).toBe(cause);
  });

  it("overrides code action reason and kind when remapping", () => {
    const cause = newRichError({
      code: "INNER_CODE",
      details: {
        action: "ReadOidcTokenResponseBody",
        reason: "Failed to read response body.",
      },
      isOperational: true,
      kind: "BadGateway",
      layer: "Presentation",
      meta: {
        source: "oidc",
      },
    });

    const remapped = remapOidcError(cause, {
      action: "RefreshOidcTokens",
      code: "CLI_AUTH_REFRESH_FAILED",
      kind: "Unauthorized",
      reason: "Failed to refresh access token.",
    });

    expect(remapped).not.toBe(cause);
    expect(remapped.code).toBe("CLI_AUTH_REFRESH_FAILED");
    expect(remapped.details?.action).toBe("RefreshOidcTokens");
    expect(remapped.details?.reason).toBe("Failed to read response body.");
    expect(remapped.kind).toBe("Unauthorized");
    expect(remapped.meta).toEqual({
      source: "oidc",
    });
  });

  it("prefers rich error detail reason over fallback in toReason", () => {
    const cause = newRichError({
      code: "INNER_CODE",
      details: {
        action: "ReadOidcTokenResponseBody",
        reason: "Preferred reason.",
      },
      isOperational: true,
      kind: "BadGateway",
      layer: "Presentation",
    });

    expect(toReason(cause, "Fallback reason.")).toBe("Preferred reason.");
  });
});
