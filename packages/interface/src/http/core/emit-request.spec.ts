import { describe, expect, it, vi } from "vitest";

import type { RequestLogger } from "@o3osatoshi/logging";
import { authErrorCodes } from "@repo/auth";
import { newRichError } from "@o3osatoshi/toolkit";

import { emitRequestSummary } from "./emit-request";

describe("http/core emit-request", () => {
  it("attaches rich error attributes on client errors", () => {
    const warn = vi.fn();
    const logger = {
      error: vi.fn(),
      info: vi.fn(),
      metric: vi.fn(),
      warn,
    };
    const requestLogger = { logger } as unknown as RequestLogger;

    const error = newRichError({
      code: authErrorCodes.OIDC_ACCESS_TOKEN_AUDIENCE_MISMATCH,
      details: {
        action: "VerifyOidcAccessToken",
        reason: "Access token audience does not match this API.",
      },
      i18n: { key: "errors.application.unauthorized" },
      isOperational: true,
      kind: "Unauthorized",
      layer: "External",
    });

    emitRequestSummary(requestLogger, 401, 25, error);

    expect(warn).toHaveBeenCalledTimes(1);
    const attrs = warn.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(attrs["http.status_code"]).toBe(401);
    expect(attrs["error.code"]).toBe(
      authErrorCodes.OIDC_ACCESS_TOKEN_AUDIENCE_MISMATCH,
    );
    expect(attrs["error.kind"]).toBe("Unauthorized");
    expect(attrs["error.layer"]).toBe("External");
    expect(attrs["error.reason"]).toBe(
      "Access token audience does not match this API.",
    );
  });

  it("does not attach error attributes when error is missing", () => {
    const warn = vi.fn();
    const logger = {
      error: vi.fn(),
      info: vi.fn(),
      metric: vi.fn(),
      warn,
    };
    const requestLogger = { logger } as unknown as RequestLogger;

    emitRequestSummary(requestLogger, 404, 10);

    expect(warn).toHaveBeenCalledTimes(1);
    const attrs = warn.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(attrs["error.code"]).toBeUndefined();
    expect(attrs["error.kind"]).toBeUndefined();
    expect(attrs["error.layer"]).toBeUndefined();
    expect(attrs["error.reason"]).toBeUndefined();
  });
});
