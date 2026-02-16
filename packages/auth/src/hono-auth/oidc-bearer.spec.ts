import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const createRemoteJWKSetMock = vi.fn(() => Symbol("jwks"));
  const jwtVerifyMock = vi.fn();
  return { createRemoteJWKSetMock, jwtVerifyMock };
});

vi.mock("jose", () => ({
  createRemoteJWKSet: h.createRemoteJWKSetMock,
  jwtVerify: h.jwtVerifyMock,
}));

import {
  createOidcAccessTokenVerifier,
  parseScopes,
  verifyOidcAccessToken,
} from "./oidc-bearer";

describe("hono-auth/oidc-bearer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("parseScopes parses and de-duplicates scope strings", () => {
    expect(parseScopes("a b a")).toEqual(["a", "b"]);
    expect(parseScopes("")).toEqual([]);
    expect(parseScopes(undefined)).toEqual([]);
  });

  it("verifies token and returns normalized claims", async () => {
    h.jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        aud: "https://api.o3o.app",
        iss: "https://example.auth0.com",
        scope: "transactions:read",
        sub: "auth0|abc",
      },
    });

    const verifier = createOidcAccessTokenVerifier({
      audience: "https://api.o3o.app",
      issuer: "https://example.auth0.com/",
    });
    const res = await verifyOidcAccessToken(verifier, "token");

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.iss).toBe("https://example.auth0.com");
      expect(res.value.sub).toBe("auth0|abc");
    }
  });

  it("returns Unauthorized when required claims are missing", async () => {
    h.jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        aud: "https://api.o3o.app",
      },
    });

    const verifier = createOidcAccessTokenVerifier({
      audience: "https://api.o3o.app",
      issuer: "https://example.auth0.com",
    });
    const res = await verifier("token");

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe("OIDC_ACCESS_TOKEN_CLAIMS_INVALID");
    }
  });

  it("returns Unauthorized on audience mismatch", async () => {
    h.jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        aud: "https://other.example",
        iss: "https://example.auth0.com",
        sub: "auth0|abc",
      },
    });

    const verifier = createOidcAccessTokenVerifier({
      audience: "https://api.o3o.app",
      issuer: "https://example.auth0.com",
    });
    const res = await verifier("token");

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe("OIDC_ACCESS_TOKEN_AUDIENCE_MISMATCH");
    }
  });
});
