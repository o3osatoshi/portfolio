import { describe, expect, it } from "vitest";

import { isRichError } from "@o3osatoshi/toolkit";

import {
  newWebError,
  webConflictError,
  webForbiddenError,
  webInternalError,
  webNotFoundError,
  webRateLimitError,
  webTimeoutError,
  webUnauthorizedError,
  webUnavailableError,
  webValidationError,
} from "./web-error";

describe("utils/web-error newWebError", () => {
  it("constructs Presentation-layer error with structured name and message", () => {
    const err = newWebError({
      action: "SubmitForm",
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

describe("utils/web-error convenience wrappers", () => {
  it("webValidationError uses Validation kind", () => {
    const err = webValidationError({ action: "Validate" });
    expect(err.name).toBe("PresentationValidationError");
  });

  it("webNotFoundError uses NotFound kind", () => {
    const err = webNotFoundError({ action: "LoadResource" });
    expect(err.name).toBe("PresentationNotFoundError");
  });

  it("webConflictError uses Conflict kind", () => {
    const err = webConflictError({ action: "UpdateResource" });
    expect(err.name).toBe("PresentationConflictError");
  });

  it("webForbiddenError uses Forbidden kind", () => {
    const err = webForbiddenError({ action: "AccessPage" });
    expect(err.name).toBe("PresentationForbiddenError");
  });

  it("webUnauthorizedError uses Unauthorized kind", () => {
    const err = webUnauthorizedError({ action: "PerformAction" });
    expect(err.name).toBe("PresentationUnauthorizedError");
  });

  it("webRateLimitError uses RateLimit kind", () => {
    const err = webRateLimitError({ action: "CallAPI" });
    expect(err.name).toBe("PresentationRateLimitError");
  });

  it("webTimeoutError uses Timeout kind", () => {
    const err = webTimeoutError({ action: "CallSlowAPI" });
    expect(err.name).toBe("PresentationTimeoutError");
  });

  it("webUnavailableError uses Unavailable kind", () => {
    const err = webUnavailableError({ action: "CallService" });
    expect(err.name).toBe("PresentationUnavailableError");
  });

  it("webInternalError uses Internal kind", () => {
    const err = webInternalError({ action: "DoSomething" });
    expect(err.name).toBe("PresentationInternalError");
  });
});
