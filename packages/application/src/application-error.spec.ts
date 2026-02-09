import { describe, expect, it } from "vitest";

import { newApplicationError } from "./application-error";

describe("application-error", () => {
  it("keeps explicit i18n payload when provided", () => {
    const err = newApplicationError({
      code: "APP_VALIDATION",
      details: { action: "ValidateInput", reason: "invalid" },
      i18n: { key: "errors.application.validation" },
      isOperational: true,
      kind: "Validation",
    });

    expect(err.code).toBe("APP_VALIDATION");
    expect(err.i18n).toEqual({ key: "errors.application.validation" });
  });

  it("allows code and i18n.key to be managed independently", () => {
    newApplicationError({
      code: "APP_TIMEOUT",
      i18n: { key: "errors.application.internal" },
      isOperational: true,
      kind: "Timeout",
    });

    expect(true).toBe(true);
  });

  it("enforces known code and i18n key unions at compile time", () => {
    newApplicationError({
      // @ts-expect-error unknown code
      code: "APP_NOT_REAL",
      i18n: { key: "errors.application.internal" },
      isOperational: false,
      kind: "Internal",
    });

    newApplicationError({
      code: "APP_INTERNAL",
      // @ts-expect-error unknown i18n key
      i18n: { key: "errors.application.unknown" },
      isOperational: false,
      kind: "Internal",
    });

    // @ts-expect-error i18n is required
    newApplicationError({
      code: "APP_INTERNAL",
      isOperational: false,
      kind: "Internal",
    });

    expect(true).toBe(true);
  });
});
