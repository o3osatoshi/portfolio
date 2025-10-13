import { describe, expect, it } from "vitest";

import { newFetchError } from "./fetch-error";

describe("toolkit newFetchError helper", () => {
  it("maps 404 responses to ExternalNotFoundError and includes method/url", () => {
    const err = newFetchError({
      action: "LoadProfile",
      request: { method: "GET", url: "/api/users/123" },
      response: { status: 404, statusText: "Not Found" },
    });

    expect(err.name).toBe("ExternalNotFoundError");
    expect(err.message).toContain("LoadProfile failed");
    expect(err.message).toContain(
      "because GET /api/users/123 responded with 404 Not Found",
    );
  });

  it("maps 503 responses to ExternalUnavailableError with a retry hint", () => {
    const err = newFetchError({
      action: "FetchStatus",
      response: { status: 503, statusText: "Service Unavailable" },
    });

    expect(err.name).toBe("ExternalUnavailableError");
    expect(err.message).toContain("FetchStatus failed");
    expect(err.message).toContain("responded with 503 Service Unavailable");
    expect(err.message).toContain(
      "Hint: Retry later; the upstream service is unavailable.",
    );
  });

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
    expect(err.message).toContain(
      "because GET https://api.example.com/feed was aborted before completing",
    );
  });

  it("treats network failures as ExternalUnavailableError", () => {
    const err = newFetchError({
      action: "FetchWidget",
      cause: new Error("fetch failed"),
    });

    expect(err.name).toBe("ExternalUnavailableError");
    expect(err.message).toContain("FetchWidget failed");
    expect(err.message).toContain("failed due to a network error");
  });

  it("flags rate limits as ExternalRateLimitError", () => {
    const err = newFetchError({
      action: "SearchUsers",
      request: { method: "GET", url: "/api/users" },
      response: { status: 429, statusText: "Too Many Requests" },
    });

    expect(err.name).toBe("ExternalRateLimitError");
    expect(err.message).toContain(
      "because GET /api/users responded with 429 Too Many Requests",
    );
  });
});
