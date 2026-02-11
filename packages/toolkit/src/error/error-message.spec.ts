import { describe, expect, it } from "vitest";

import { newRichError } from "./error";
import { interpretErrorMessage } from "./error-message";
import type { SerializedRichError } from "./error-serializer";
import { serializeRichError } from "./error-serializer";

describe("interpretErrorMessage", () => {
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
      fallback: {
        message: "unknown",
      },
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
      fallback: {
        message: "unknown",
      },
      t: (key) => key,
    });

    expect(message).toBe("errors.application.not_found");
  });

  it("uses RichError i18n key when present", () => {
    const error = newRichError({
      i18n: {
        key: "errors.application.validation",
      },
      isOperational: true,
      kind: "Validation",
      layer: "Application",
    });

    const message = interpretErrorMessage(error, {
      fallback: {
        message: "unknown",
      },
      t: (key) => key,
    });

    expect(message).toBe("errors.application.validation");
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
      fallback: {
        message: "unknown",
      },
      t: (key, values) => `${key}:${String(values?.["retriable"])}`,
    });

    expect(message).toBe("errors.integration.timeout:false");
  });

  it("falls back to fallback.i18n when primary translation fails", () => {
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
      fallback: {
        i18n: {
          key: "Common.unknownError",
        },
      },
      t: (key) => {
        if (key === "errors.application.not_found") {
          throw new Error("missing translation");
        }
        return key;
      },
    });

    expect(message).toBe("Common.unknownError");
  });

  it("falls back to fallback.i18n when i18n is missing", () => {
    const error: SerializedRichError = {
      name: "ApplicationInternalError",
      isOperational: false,
      kind: "Internal",
      layer: "Application",
      message: "internal details",
    };

    const message = interpretErrorMessage(error, {
      fallback: {
        i18n: {
          key: "Common.unknownError",
        },
      },
      t: (key) => key,
    });

    expect(message).toBe("Common.unknownError");
  });

  it("falls back to fallback.message when fallback.i18n translation also fails", () => {
    const error: SerializedRichError = {
      name: "ApplicationInternalError",
      isOperational: false,
      kind: "Internal",
      layer: "Application",
      message: "internal details",
    };

    const message = interpretErrorMessage(error, {
      fallback: {
        i18n: {
          key: "Common.unknownError",
        },
        message: "unknown",
      },
      t: () => {
        throw new Error("missing translation");
      },
    });

    expect(message).toBe("unknown");
  });

  it("returns hardcoded default when no fallback is provided", () => {
    const error: SerializedRichError = {
      name: "ApplicationInternalError",
      isOperational: false,
      kind: "Internal",
      layer: "Application",
      message: "internal details",
    };

    const message = interpretErrorMessage(error, {
      t: () => {
        throw new Error("missing translation");
      },
    });

    expect(message).toBe("Unknown error");
  });
});
