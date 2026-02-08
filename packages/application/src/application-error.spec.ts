import { describe, expect, it } from "vitest";

import {
  applicationValidationError,
  newApplicationError,
} from "./application-error";

describe("application-error", () => {
  it("keeps i18n undefined when omitted", () => {
    const err = newApplicationError({
      code: "APP_VALIDATION",
      details: { action: "ValidateInput", reason: "invalid" },
      kind: "Validation",
    });

    expect(err.code).toBe("APP_VALIDATION");
    expect(err.i18n).toBeUndefined();
  });

  it("keeps explicit i18n payload when provided", () => {
    const err = newApplicationError({
      code: "APP_NOT_FOUND",
      i18n: {
        key: "errors.application.not_found",
        params: { id: 42 },
      },
      kind: "NotFound",
    });

    expect(err.i18n).toEqual({
      key: "errors.application.not_found",
      params: { id: 42 },
    });
  });

  it("supports convenience wrappers with required code", () => {
    const err = applicationValidationError({
      code: "APP_VALIDATION",
      details: { action: "SaveUser" },
    });

    expect(err.code).toBe("APP_VALIDATION");
    expect(err.i18n).toBeUndefined();
  });

  it("allows code and i18n.key to be managed independently", () => {
    newApplicationError({
      code: "APP_TIMEOUT",
      i18n: { key: "errors.application.internal" },
      kind: "Timeout",
    });

    expect(true).toBe(true);
  });

  it("enforces known code and i18n key unions at compile time", () => {
    newApplicationError({
      // @ts-expect-error unknown code
      code: "APP_NOT_REAL",
      kind: "Internal",
    });

    newApplicationError({
      code: "APP_INTERNAL",
      // @ts-expect-error unknown i18n key
      i18n: { key: "errors.application.unknown" },
      kind: "Internal",
    });

    expect(true).toBe(true);
  });
});
