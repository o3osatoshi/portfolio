import { describe, expect, it } from "vitest";

import { type ActionError, newRichError } from "@o3osatoshi/toolkit";

import { resolveLocalizedErrorMessage } from "./error-message";

describe("utils/error-message", () => {
  it("uses ActionError i18n key when present", () => {
    const error: ActionError = {
      name: "ActionError",
      i18n: {
        key: "errors.application.forbidden",
        params: { resource: "transaction" },
      },
      message: "fallback",
    };

    const message = resolveLocalizedErrorMessage(error, {
      fallbackMessage: "unknown",
      t: (key, values) => `${key}:${String(values?.["resource"])}`,
    });

    expect(message).toBe("errors.application.forbidden:transaction");
  });

  it("uses RichError i18n key when present", () => {
    const error = newRichError({
      i18n: {
        key: "errors.application.not_found",
      },
      kind: "NotFound",
      layer: "Application",
    });

    const message = resolveLocalizedErrorMessage(error, {
      fallbackMessage: "unknown",
      t: (key) => key,
    });

    expect(message).toBe("errors.application.not_found");
  });

  it("falls back to message when translation fails", () => {
    const error: ActionError = {
      name: "ActionError",
      i18n: {
        key: "errors.application.not_found",
      },
      message: "record missing",
    };

    const message = resolveLocalizedErrorMessage(error, {
      fallbackMessage: "unknown",
      t: () => {
        throw new Error("missing translation");
      },
    });

    expect(message).toBe("record missing");
  });

  it("falls back to fallbackMessage when message is empty", () => {
    const error: ActionError = {
      name: "ActionError",
      message: "",
    };

    const message = resolveLocalizedErrorMessage(error, {
      fallbackMessage: "unknown",
      t: () => "translated",
    });

    expect(message).toBe("unknown");
  });
});
