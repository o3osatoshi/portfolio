import { describe, expect, it } from "vitest";

import { isRichError } from "@o3osatoshi/toolkit";

import { newWebError, webErrorCodes, webErrorI18nKeys } from "./web-error";

describe("utils/web-error newWebError", () => {
  it("constructs Presentation-layer error with structured name and message", () => {
    const err = newWebError({
      action: "SubmitForm",
      code: webErrorCodes.VALIDATION,
      hint: "Check the form fields.",
      i18n: { key: webErrorI18nKeys.VALIDATION },
      impact: "Form submission failed.",
      kind: "Validation",
      reason: "invalid payload",
    });

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("PresentationValidationError");
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.action).toBe("SubmitForm");
      expect(err.details?.reason).toBe("invalid payload");
      expect(err.details?.impact).toBe("Form submission failed.");
      expect(err.details?.hint).toBe("Check the form fields.");
      expect(err.i18n?.key).toBe("errors.application.validation");
    }
  });
});

describe("utils/web-error newWebError kinds", () => {
  it.each([
    {
      code: webErrorCodes.VALIDATION,
      expectedName: "PresentationValidationError",
      i18nKey: webErrorI18nKeys.VALIDATION,
      kind: "Validation" as const,
    },
    {
      code: webErrorCodes.NOT_FOUND,
      expectedName: "PresentationNotFoundError",
      i18nKey: webErrorI18nKeys.NOT_FOUND,
      kind: "NotFound" as const,
    },
    {
      code: webErrorCodes.CONFLICT,
      expectedName: "PresentationConflictError",
      i18nKey: webErrorI18nKeys.CONFLICT,
      kind: "Conflict" as const,
    },
    {
      code: webErrorCodes.FORBIDDEN,
      expectedName: "PresentationForbiddenError",
      i18nKey: webErrorI18nKeys.FORBIDDEN,
      kind: "Forbidden" as const,
    },
    {
      code: webErrorCodes.UNAUTHORIZED,
      expectedName: "PresentationUnauthorizedError",
      i18nKey: webErrorI18nKeys.UNAUTHORIZED,
      kind: "Unauthorized" as const,
    },
    {
      code: webErrorCodes.RATE_LIMIT,
      expectedName: "PresentationRateLimitError",
      i18nKey: webErrorI18nKeys.RATE_LIMIT,
      kind: "RateLimit" as const,
    },
    {
      code: webErrorCodes.TIMEOUT,
      expectedName: "PresentationTimeoutError",
      i18nKey: webErrorI18nKeys.TIMEOUT,
      kind: "Timeout" as const,
    },
    {
      code: webErrorCodes.UNAVAILABLE,
      expectedName: "PresentationUnavailableError",
      i18nKey: webErrorI18nKeys.UNAVAILABLE,
      kind: "Unavailable" as const,
    },
    {
      code: webErrorCodes.INTERNAL,
      expectedName: "PresentationInternalError",
      i18nKey: webErrorI18nKeys.INTERNAL,
      kind: "Internal" as const,
    },
  ])("uses $kind kind", ({ code, expectedName, i18nKey, kind }) => {
    const err = newWebError({
      action: "HandleError",
      code,
      i18n: { key: i18nKey },
      kind,
    });
    expect(err.name).toBe(expectedName);
  });
});
