import { describe, expect, it } from "vitest";

import {
  newRichError,
  type SerializedRichError,
  serializeRichError,
} from "@o3osatoshi/toolkit";

import { resolveLocalizedErrorMessage } from "./error-message";

describe("utils/error-message", () => {
  it("uses SerializedRichError i18n key when present", () => {
    const error: SerializedRichError = {
      name: "ApplicationForbiddenError",
      i18n: {
        key: "errors.application.forbidden",
        params: { resource: "transaction" },
      },
      kind: "Forbidden",
      layer: "Application",
      message: "fallback",
    };

    const message = resolveLocalizedErrorMessage(error, {
      fallbackMessage: "unknown",
      t: (key, values) => `${key}:${String(values?.["resource"])}`,
    });

    expect(message).toBe("errors.application.forbidden:transaction");
  });

  it("uses RichError i18n key when present", () => {
    const error = serializeRichError(
      newRichError({
        i18n: {
          key: "errors.application.not_found",
        },
        kind: "NotFound",
        layer: "Application",
      }),
      { includeStack: false },
    );

    const message = resolveLocalizedErrorMessage(error, {
      fallbackMessage: "unknown",
      t: (key) => key,
    });

    expect(message).toBe("errors.application.not_found");
  });

  it("falls back to fallbackMessage when translation fails", () => {
    const error: SerializedRichError = {
      name: "ApplicationNotFoundError",
      i18n: {
        key: "errors.application.not_found",
      },
      kind: "NotFound",
      layer: "Application",
      message: "record missing",
    };

    const message = resolveLocalizedErrorMessage(error, {
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
      kind: "Internal",
      layer: "Application",
      message: "internal details",
    };

    const message = resolveLocalizedErrorMessage(error, {
      fallbackMessage: "unknown",
      t: () => "translated",
    });

    expect(message).toBe("unknown");
  });
});
