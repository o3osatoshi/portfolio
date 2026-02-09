import { describe, expect, it } from "vitest";

import { isRichError } from "@o3osatoshi/toolkit";

import { newWebError, webErrorCodes } from "./web-error";

describe("utils/web-error newWebError", () => {
  it("constructs Presentation-layer error with structured name and message", () => {
    const err = newWebError({
      action: "SubmitForm",
      code: webErrorCodes.VALIDATION,
      hint: "Check the form fields.",
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
    }
  });
});

describe("utils/web-error newWebError kinds", () => {
  it.each([
    {
      code: webErrorCodes.VALIDATION,
      expectedName: "PresentationValidationError",
      kind: "Validation" as const,
    },
    {
      code: webErrorCodes.NOT_FOUND,
      expectedName: "PresentationNotFoundError",
      kind: "NotFound" as const,
    },
    {
      code: webErrorCodes.CONFLICT,
      expectedName: "PresentationConflictError",
      kind: "Conflict" as const,
    },
    {
      code: webErrorCodes.FORBIDDEN,
      expectedName: "PresentationForbiddenError",
      kind: "Forbidden" as const,
    },
    {
      code: webErrorCodes.UNAUTHORIZED,
      expectedName: "PresentationUnauthorizedError",
      kind: "Unauthorized" as const,
    },
    {
      code: webErrorCodes.RATE_LIMIT,
      expectedName: "PresentationRateLimitError",
      kind: "RateLimit" as const,
    },
    {
      code: webErrorCodes.TIMEOUT,
      expectedName: "PresentationTimeoutError",
      kind: "Timeout" as const,
    },
    {
      code: webErrorCodes.UNAVAILABLE,
      expectedName: "PresentationUnavailableError",
      kind: "Unavailable" as const,
    },
    {
      code: webErrorCodes.INTERNAL,
      expectedName: "PresentationInternalError",
      kind: "Internal" as const,
    },
  ])("uses $kind kind", ({ code, expectedName, kind }) => {
    const err = newWebError({
      action: "HandleError",
      code,
      kind,
    });
    expect(err.name).toBe(expectedName);
  });
});
