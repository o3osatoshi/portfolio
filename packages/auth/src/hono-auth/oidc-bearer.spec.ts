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

  it("verifies token and accepts issuer with trailing-slash difference", async () => {
    h.jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        aud: "https://api.o3o.app",
        iss: "https://example.auth0.com/",
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
      expect(res.value.iss).toBe("https://example.auth0.com/");
      expect(res.value.sub).toBe("auth0|abc");
    }

    expect(h.jwtVerifyMock).toHaveBeenCalledWith(
      "token",
      expect.anything(),
      expect.objectContaining({
        audience: "https://api.o3o.app",
      }),
    );
    expect(h.jwtVerifyMock.mock.calls[0]?.[2]).not.toHaveProperty("issuer");
  });

  it("reuses remote JWKS set across multiple token verifications", async () => {
    h.jwtVerifyMock
      .mockResolvedValueOnce({
        payload: {
          aud: "https://api.o3o.app",
          iss: "https://example.auth0.com",
          sub: "auth0|abc",
        },
      })
      .mockResolvedValueOnce({
        payload: {
          aud: "https://api.o3o.app",
          iss: "https://example.auth0.com",
          sub: "auth0|def",
        },
      });

    const verifier = createOidcAccessTokenVerifier({
      audience: "https://api.o3o.app",
      issuer: "https://example.auth0.com",
    });

    await verifier("token-1");
    await verifier("token-2");

    expect(h.createRemoteJWKSetMock).toHaveBeenCalledTimes(1);
    expect(h.jwtVerifyMock).toHaveBeenCalledTimes(2);
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

  it("returns Unauthorized on issuer mismatch after normalized compare", async () => {
    h.jwtVerifyMock.mockResolvedValueOnce({
      payload: {
        aud: "https://api.o3o.app",
        iss: "https://another.auth0.com/",
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
      expect(res.error.code).toBe("OIDC_ACCESS_TOKEN_ISSUER_MISMATCH");
    }
  });

  it("maps jose audience claim validation failures to audience mismatch", async () => {
    h.jwtVerifyMock.mockRejectedValueOnce(
      joseLikeError("JWTClaimValidationFailed", 'unexpected "aud" claim value'),
    );

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

  it("maps jose expiration failures to expired", async () => {
    h.jwtVerifyMock.mockRejectedValueOnce(
      joseLikeError("JWTExpired", '"exp" claim timestamp check failed'),
    );

    const verifier = createOidcAccessTokenVerifier({
      audience: "https://api.o3o.app",
      issuer: "https://example.auth0.com",
    });
    const res = await verifier("token");

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe("OIDC_ACCESS_TOKEN_EXPIRED");
    }
  });

  it("maps non-Error jwt failures when jose-style code is present", async () => {
    h.jwtVerifyMock.mockRejectedValueOnce({
      code: "ERR_JWT_EXPIRED",
      message: "token expired",
    });

    const verifier = createOidcAccessTokenVerifier({
      audience: "https://api.o3o.app",
      issuer: "https://example.auth0.com",
    });
    const res = await verifier("token");

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe("OIDC_ACCESS_TOKEN_EXPIRED");
    }
  });
});

function joseLikeError(name: string, message: string): Error {
  const error = new Error(message);
  error.name = name;
  return error;
}
