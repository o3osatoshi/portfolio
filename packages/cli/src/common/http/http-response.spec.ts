import { describe, expect, it } from "vitest";

import {
  decodeHttpJson,
  expectOkHttpResponse,
  readHttpJson,
  readHttpText,
} from "./http-response";

describe("common/http/http-response", () => {
  it("returns status-aware reason for non-2xx responses", () => {
    const result = expectOkHttpResponse(
      new Response("Forbidden", { status: 403 }),
      {
        action: "RequestCliApi",
        code: "CLI_API_REQUEST_FAILED",
        kind: "Forbidden",
        reason: "API request failed.",
      },
    );

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.reason).toBe("API request failed. (403)");
  });

  it("returns RichError when response text cannot be read", async () => {
    const response = {
      text: () => Promise.reject(new Error("stream failed")),
    } as Response;

    const result = await readHttpText(response, {
      action: "ReadCliApiResponseBody",
      code: "CLI_API_REQUEST_FAILED",
      kind: "BadGateway",
      reason: "Failed to read API response body.",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("ReadCliApiResponseBody");
  });

  it("returns RichError when response json cannot be read", async () => {
    const response = {
      json: () => Promise.reject(new Error("invalid json stream")),
    } as Response;

    const result = await readHttpJson(response, {
      action: "ReadOidcDiscoveryResponseBody",
      code: "CLI_AUTH_LOGIN_FAILED",
      kind: "BadGateway",
      reason: "Failed to read OIDC discovery response body.",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("ReadOidcDiscoveryResponseBody");
  });

  it("returns RichError when JSON text is invalid", () => {
    const result = decodeHttpJson("{invalid", {
      action: "DecodeCliApiResponseBody",
      code: "CLI_API_REQUEST_FAILED",
      kind: "BadGateway",
      reason: "API response was not valid JSON.",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.details?.action).toBe("DecodeCliApiResponseBody");
  });
});
