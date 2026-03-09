import { afterEach, describe, expect, it, vi } from "vitest";

import { requestHttp } from "./http-request";

describe("common/http/http-request", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns RichError when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(new Error("offline")),
    );

    const result = await requestHttp(
      "https://example.com/data",
      { method: "GET" },
      {
        action: "FetchExternalApi",
        code: "CLI_API_REQUEST_FAILED",
        kind: "BadGateway",
        reason: "Failed to reach the API endpoint.",
      },
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.code).toBe("CLI_API_REQUEST_FAILED");
    expect(result.error.details?.action).toBe("FetchExternalApi");
    expect(result.error.details?.reason).toBe(
      "Failed to reach the API endpoint.",
    );
    expect(result.error.kind).toBe("BadGateway");
  });
});
