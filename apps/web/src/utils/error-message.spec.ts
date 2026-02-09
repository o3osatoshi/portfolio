import { describe, expect, it } from "vitest";

import {
  newRichError,
  type SerializedRichError,
  serializeRichError,
} from "@o3osatoshi/toolkit";

import { interpretErrorMessage } from "./error-message";

describe("utils/error-message", () => {
  it("uses SerializedRichError i18n key when present", () => {
    const error: SerializedRichError = {
      name: "ApplicationForbiddenError",
      i18n: {
        key: "errors.application.forbidden",
        params: { resource: "transaction" },
      },
      isOperational: true,
      kind: "Forbidden",
      layer: "Application",
      message: "fallback",
    };

    const message = interpretErrorMessage(error, {
      fallbackMessage: "unknown",
      t: (key, values) => `${key}:${String(values?.["resource"])}`,
    });

    expect(message).toBe("errors.application.forbidden:transaction");
  });

  it("uses serialized RichError i18n key when present", () => {
    const error = serializeRichError(
      newRichError({
        i18n: {
          key: "errors.application.not_found",
        },
        isOperational: true,
        kind: "NotFound",
        layer: "Application",
      }),
      { includeStack: false },
    );

    const message = interpretErrorMessage(error, {
      fallbackMessage: "unknown",
      t: (key) => key,
    });

    expect(message).toBe("errors.application.not_found");
  });

  it("converts boolean i18n params to string before translation", () => {
    const error: SerializedRichError = {
      name: "IntegrationTimeoutError",
      i18n: {
        key: "errors.integration.timeout",
        params: { retriable: false },
      },
      isOperational: true,
      kind: "Timeout",
      layer: "Infrastructure",
      message: "timeout",
    };

    const message = interpretErrorMessage(error, {
      fallbackMessage: "unknown",
      t: (key, values) => `${key}:${String(values?.["retriable"])}`,
    });

    expect(message).toBe("errors.integration.timeout:false");
  });

  it("falls back to fallbackMessage when translation fails", () => {
    const error: SerializedRichError = {
      name: "ApplicationNotFoundError",
      i18n: {
        key: "errors.application.not_found",
      },
      isOperational: true,
      kind: "NotFound",
      layer: "Application",
      message: "record missing",
    };

    const message = interpretErrorMessage(error, {
      fallbackMessage: "unknown",
      t: () => {
        throw new Error("missing translation");
      },
    });

    expect(message).toBe("unknown");
  });

  it("falls back to fallbackMessage when i18n is missing", () => {
    const error: SerializedRichError = {
      name: "ApplicationInternalError",
      isOperational: false,
      kind: "Internal",
      layer: "Application",
      message: "internal details",
    };

    const message = interpretErrorMessage(error, {
      fallbackMessage: "unknown",
      t: () => "translated",
    });

    expect(message).toBe("unknown");
  });

  it("falls back to fallbackMessage for native Error", () => {
    const message = interpretErrorMessage(new Error("boom"), {
      fallbackMessage: "unknown",
      t: () => "translated",
    });

    expect(message).toBe("unknown");
  });
});
