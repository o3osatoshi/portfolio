import { describe, expect, it, type MockedFunction, vi } from "vitest";

import { integrationErrorCodes } from "../integration-error-catalog";
import { createOidcUserInfoFetcher } from "./oidc-user-info";

function createMockResponse(
  overrides: {
    json: () => Promise<unknown>;
  } & Partial<Response>,
): Response {
  return {
    ...{
      headers: new Headers({
        "content-type": "application/json",
      }),
      ok: true,
      status: 200,
      statusText: "OK",
      type: "basic",
      url: "https://example.auth0.com/userinfo",
    },
    ...overrides,
  } as unknown as Response;
}

describe("createOidcUserInfoFetcher", () => {
  it("fetches and maps OIDC userinfo using a normalized issuer", async () => {
    const fetchMock: MockedFunction<typeof fetch> = vi.fn();
    const response = createMockResponse({
      json: async () => ({
        name: "Ada",
        email: "ada@example.com",
        email_verified: true,
        picture: "https://example.com/ada.png",
        sub: "auth0|abc",
      }),
      statusText: "OK",
    });
    fetchMock.mockResolvedValue(response);

    const fetchUserInfo = createOidcUserInfoFetcher({
      fetch: fetchMock,
    });

    const res = await fetchUserInfo({
      accessToken: "token",
      issuer: "https://example.auth0.com/",
    });

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value).toEqual({
        name: "Ada",
        email: "ada@example.com",
        emailVerified: true,
        image: "https://example.com/ada.png",
        subject: "auth0|abc",
      });
    }
    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.auth0.com/userinfo",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("returns unauthorized error when /userinfo responds without ok", async () => {
    const fetchMock: MockedFunction<typeof fetch> = vi.fn();
    const response = createMockResponse({
      json: async () => ({}),
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    });
    fetchMock.mockResolvedValue(response);

    const fetchUserInfo = createOidcUserInfoFetcher({
      fetch: fetchMock,
    });

    const res = await fetchUserInfo({
      accessToken: "token",
      issuer: "https://example.auth0.com",
    });

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe(
        integrationErrorCodes.OIDC_USERINFO_UNAUTHORIZED,
      );
    }
  });

  it("returns parse error when JSON parsing fails", async () => {
    const fetchMock: MockedFunction<typeof fetch> = vi.fn();
    const response = createMockResponse({
      json: async () => {
        throw new Error("invalid json");
      },
    });
    fetchMock.mockResolvedValue(response);

    const fetchUserInfo = createOidcUserInfoFetcher({
      fetch: fetchMock,
    });

    const res = await fetchUserInfo({
      accessToken: "token",
      issuer: "https://example.auth0.com",
    });

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe(
        integrationErrorCodes.OIDC_USERINFO_PARSE_FAILED,
      );
    }
  });

  it("returns schema error when response payload mismatches", async () => {
    const fetchMock: MockedFunction<typeof fetch> = vi.fn();
    const response = createMockResponse({
      json: async () => ({ email: "not-an-email", sub: "" }),
    });
    fetchMock.mockResolvedValue(response);

    const fetchUserInfo = createOidcUserInfoFetcher({
      fetch: fetchMock,
    });

    const res = await fetchUserInfo({
      accessToken: "token",
      issuer: "https://example.auth0.com",
    });

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe(
        integrationErrorCodes.OIDC_USERINFO_SCHEMA_INVALID,
      );
    }
  });
});
