import { describe, expect, it } from "vitest";

import { newFetchError } from "./fetch-error";

describe("toolkit newFetchError helper", () => {
  it("marks aborted requests as ExternalTimeoutError", () => {
    const cause = Object.assign(new Error("signal aborted"), {
      name: "AbortError",
    });
    const err = newFetchError({
      action: "StreamFeed",
      cause,
      request: { method: "GET", url: "https://api.example.com/feed" },
    });

    expect(err.name).toBe("ExternalTimeoutError");
    expect(err.message).toContain("StreamFeed failed");
    expect(err.message).toContain(
      "because GET https://api.example.com/feed was aborted before completing",
    );
  });

  it("treats network failures as ExternalUnavailableError with a connectivity hint", () => {
    const err = newFetchError({
      action: "FetchWidget",
      cause: new Error("fetch failed"),
      request: { method: "GET", url: "/api/widgets/123" },
    });

    expect(err.name).toBe("ExternalUnavailableError");
    expect(err.message).toContain("FetchWidget failed");
    expect(err.message).toContain(
      "because GET /api/widgets/123 failed due to a network error",
    );
    expect(err.message).toContain(
      "Hint: Verify network connectivity or upstream availability.",
    );
  });

  it("handles missing cause and request metadata gracefully", () => {
    const err = newFetchError({
      action: "DoSomething",
    });

    expect(err.name).toBe("ExternalUnknownError");
    expect(err.message).toContain("DoSomething failed");
    expect(err.message).toContain("because encountered an unexpected error");
  });

  it("formats the target when only URL metadata is available", () => {
    const err = newFetchError({
      action: "LoadProfile",
      cause: new Error("boom"),
      request: { url: "/proxy/users/123" },
    });

    expect(err.name).toBe("ExternalUnknownError");
    expect(err.message).toContain("because /proxy/users/123 failed with boom");
  });

  it("allows overriding the classification kind when provided", () => {
    const err = newFetchError({
      action: "SubmitForm",
      cause: new Error("invalid credentials"),
      kind: "Forbidden",
      request: { method: "POST", url: "/api/login" },
    });

    expect(err.name).toBe("ExternalForbiddenError");
    expect(err.message).toContain(
      "because POST /api/login failed with invalid credentials",
    );
  });
});
