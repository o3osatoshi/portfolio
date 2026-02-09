import { describe, expect, it } from "vitest";

import { newApplicationError, toApplicationError } from "./application-error";

describe("application-error", () => {
  it("keeps explicit i18n payload when provided", () => {
    const err = newApplicationError({
      code: "APP_VALIDATION",
      details: { action: "ValidateInput", reason: "invalid" },
      i18n: { key: "errors.application.validation" },
      kind: "Validation",
    });

    expect(err.code).toBe("APP_VALIDATION");
    expect(err.i18n).toEqual({ key: "errors.application.validation" });
  });

  it("toApplicationError infers i18n from normalized kind", () => {
    const err = toApplicationError({
      action: "LoadTransactions",
      cause: new Error("boom"),
      code: "APP_GET_TRANSACTIONS_FAILED",
      kind: "Timeout",
    });

    expect(err.i18n).toEqual({
      key: "errors.application.timeout",
    });
    expect(err.name).toBe("ApplicationTimeoutError");
  });

  it("toApplicationError keeps existing application errors with i18n", () => {
    const existing = newApplicationError({
      code: "APP_NOT_FOUND",
      i18n: { key: "errors.application.not_found" },
      kind: "NotFound",
    });

    const wrapped = toApplicationError({
      action: "AnyAction",
      cause: existing,
      code: "APP_INTERNAL",
    });

    expect(wrapped).toBe(existing);
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
      i18n: { key: "errors.application.internal" },
      kind: "Internal",
    });

    newApplicationError({
      code: "APP_INTERNAL",
      // @ts-expect-error unknown i18n key
      i18n: { key: "errors.application.unknown" },
      kind: "Internal",
    });

    // @ts-expect-error i18n is required
    newApplicationError({
      code: "APP_INTERNAL",
      kind: "Internal",
    });

    expect(true).toBe(true);
  });
});
