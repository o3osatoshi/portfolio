import { describe, expect, it } from "vitest";

import {
  buildErrorSummary,
  isRichError,
  newRichError,
  toRichError,
} from "./error";

describe("RichError", () => {
  it("composes name + summary and preserves structured fields", () => {
    const cause = new Error("DB timeout");
    const err = newRichError({
      cause,
      code: "user.fetch.timeout",
      details: {
        action: "FetchUser",
        hint: "retry with backoff",
        impact: "no data returned",
        reason: "dependency unavailable",
      },
      i18n: { key: "error.user_fetch", params: { id: 1 } },
      kind: "Timeout",
      layer: "Infrastructure",
      meta: { requestId: "req_123" },
    });

    expect(err.name).toBe("InfrastructureTimeoutError");
    expect(err.message).toBe("FetchUser failed: dependency unavailable");
    expect(err.details?.hint).toBe("retry with backoff");
    expect(err.details?.impact).toBe("no data returned");
    expect(err.code).toBe("user.fetch.timeout");
    expect(err.i18n?.key).toBe("error.user_fetch");
    expect(err.meta).toEqual({ requestId: "req_123" });
    expect(err.cause).toBe(cause);
    expect(isRichError(err)).toBe(true);
  });

  it("normalizes unknown values to RichError with defaults", () => {
    const err = toRichError("boom");
    expect(err.kind).toBe("Internal");
    expect(err.layer).toBe("External");
    expect(err.details?.reason).toBe("boom");
    expect(err.cause).toBe("boom");
  });

  it("merges fallback details with extracted reason when reason is missing", () => {
    const err = toRichError(new Error("boom"), {
      details: { action: "FetchUser" },
    });

    expect(err.details).toEqual({
      action: "FetchUser",
      reason: "boom",
    });
  });

  it("preserves fallback reason when explicitly provided", () => {
    const err = toRichError(new Error("boom"), {
      details: { reason: "override-reason" },
    });

    expect(err.details?.reason).toBe("override-reason");
  });

  it("builds summaries from details", () => {
    expect(buildErrorSummary({ action: "SaveUser" })).toBe("SaveUser failed");
    expect(buildErrorSummary({ reason: "Something went wrong" })).toBe(
      "Something went wrong",
    );
  });
});
