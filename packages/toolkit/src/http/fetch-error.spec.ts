import { describe, expect, it } from "vitest";

import { isRichError } from "../error";
import { newFetchError } from "./fetch-error";

describe("toolkit newFetchError helper", () => {
  it("marks aborted requests as ExternalTimeoutError", () => {
    const cause = Object.assign(new Error("signal aborted"), {
      name: "AbortError",
    });
    const err = newFetchError({
      cause,
      details: { action: "StreamFeed" },
      request: { method: "GET", url: "https://api.example.com/feed" },
    });

    expect(err.name).toBe("ExternalTimeoutError");
    const message = err.message;
    expect(message).toContain(
      "StreamFeed failed: GET https://api.example.com/feed was aborted before completing",
    );
  });

  it("treats network failures as ExternalUnavailableError with a connectivity hint", () => {
    const err = newFetchError({
      cause: new Error("fetch failed"),
      details: { action: "FetchWidget" },
      request: { method: "GET", url: "/api/widgets/123" },
    });

    expect(err.name).toBe("ExternalUnavailableError");
    const message = err.message;
    expect(message).toContain(
      "FetchWidget failed: GET /api/widgets/123 failed due to a network error",
    );
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.hint).toBe(
        "Verify network connectivity or upstream availability.",
      );
    }
  });

  it("handles missing cause and request metadata gracefully", () => {
    const err = newFetchError({
      details: { action: "DoSomething" },
    });

    expect(err.name).toBe("ExternalUnknownError");
    expect(err.message).toContain(
      "DoSomething failed: encountered an unexpected error",
    );
  });

  it("formats the target when only URL metadata is available", () => {
    const err = newFetchError({
      cause: new Error("boom"),
      details: { action: "LoadProfile" },
      request: { url: "/proxy/users/123" },
    });

    expect(err.name).toBe("ExternalUnknownError");
    expect(err.message).toContain(
      "LoadProfile failed: /proxy/users/123 failed with boom",
    );
  });

  it("allows overriding the classification kind when provided", () => {
    const err = newFetchError({
      cause: new Error("invalid credentials"),
      details: { action: "SubmitForm" },
      kind: "Forbidden",
      request: { method: "POST", url: "/api/login" },
    });

    expect(err.name).toBe("ExternalForbiddenError");
    expect(err.message).toContain(
      "SubmitForm failed: POST /api/login failed with invalid credentials",
    );
  });

  it("treats timeout phrases as ExternalTimeoutError with inferred hint", () => {
    const err = newFetchError({
      cause: new Error("Request timed out after 10s"),
      details: { action: "UploadAsset" },
      request: { method: "POST", url: "/api/assets" },
    });

    expect(err.name).toBe("ExternalTimeoutError");
    const message = err.message;
    expect(message).toContain("UploadAsset failed: POST /api/assets timed out");
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.hint).toBe(
        "Retry with a longer timeout or inspect upstream latency.",
      );
    }
  });

  it("formats method-only requests when URL is missing", () => {
    const err = newFetchError({
      cause: new Error("bad gateway"),
      details: { action: "Ping" },
      request: { method: "head" },
    });

    expect(err.name).toBe("ExternalUnavailableError");
    expect(err.message).toContain("Ping failed: HEAD failed with bad gateway");
  });
});
