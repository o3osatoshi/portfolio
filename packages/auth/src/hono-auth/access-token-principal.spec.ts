import type { UserId } from "@repo/domain";
import { integrationErrorCodes } from "@repo/integrations";
import { okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { authErrorCodes } from "../auth-error-catalog";
import { authorizeScope, extractBearerToken } from "./access-token-guard";
import { createAccessTokenPrincipalResolver } from "./access-token-principal";

const h = vi.hoisted(() => {
  const createVerifierMock = vi.fn();
  const verifyTokenMock = vi.fn();
  createVerifierMock.mockImplementation(() => verifyTokenMock);
  return { createVerifierMock, verifyTokenMock };
});

vi.mock("./oidc-access-token", () => ({
  createOidcAccessTokenVerifier: h.createVerifierMock,
  parseScopes: (scope: unknown) =>
    typeof scope === "string" ? scope.split(" ").filter(Boolean) : [],
}));

function asUserId(value: string): UserId {
  return value as UserId;
}

describe("hono-auth/access-token-principal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns existing mapped user without calling /userinfo", async () => {
    const findUserIdByExternalIdentity = vi.fn(() => okAsync(asUserId("u-1")));
    h.verifyTokenMock.mockReturnValueOnce(
      okAsync({
        iss: "https://example.auth0.com/",
        scope: "transactions:read",
        sub: "auth0|123",
      }),
    );
    const fetchMock = vi.fn();
    const resolve = createAccessTokenPrincipalResolver({
      audience: "https://api.o3o.app",
      fetchImpl: fetchMock as unknown as typeof fetch,
      findUserIdByKey: findUserIdByExternalIdentity,
      issuer: "https://example.auth0.com",
      linkExternalIdentityToUserByEmail: () => okAsync(asUserId("u-new")),
    });

    const res = await resolve({ accessToken: "token" });

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.issuer).toBe("https://example.auth0.com");
      expect(res.value.userId).toBe("u-1");
      expect(res.value.scopes).toEqual(["transactions:read"]);
    }
    expect(findUserIdByExternalIdentity).toHaveBeenCalledWith({
      issuer: "https://example.auth0.com",
      subject: "auth0|123",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches /userinfo and links identity when mapping does not exist", async () => {
    h.verifyTokenMock.mockReturnValueOnce(
      okAsync({
        iss: "https://example.auth0.com",
        scope: "transactions:read transactions:write",
        sub: "auth0|123",
      }),
    );
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          name: "Ada",
          email: "ada@example.com",
          email_verified: true,
          picture: "https://example.com/ada.png",
          sub: "auth0|123",
        }),
        {
          headers: {
            "content-type": "application/json",
          },
          status: 200,
        },
      ),
    );
    const linkExternalIdentityToUserByEmail = vi.fn(() =>
      okAsync(asUserId("u-2")),
    );

    const resolve = createAccessTokenPrincipalResolver({
      audience: "https://api.o3o.app",
      fetchImpl: fetchMock as unknown as typeof fetch,
      findUserIdByKey: () => okAsync(null),
      issuer: "https://example.auth0.com",
      linkExternalIdentityToUserByEmail: linkExternalIdentityToUserByEmail,
    });

    const res = await resolve({ accessToken: "token" });

    expect(res.isOk()).toBe(true);
    expect(linkExternalIdentityToUserByEmail).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@example.com",
      emailVerified: true,
      image: "https://example.com/ada.png",
      issuer: "https://example.auth0.com",
      subject: "auth0|123",
    });
  });

  it("propagates /userinfo unauthorized failures as integration-layer error codes", async () => {
    h.verifyTokenMock.mockReturnValueOnce(
      okAsync({
        iss: "https://example.auth0.com",
        scope: "transactions:read",
        sub: "auth0|123",
      }),
    );
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ error: "forbidden" }), {
        headers: {
          "content-type": "application/json",
        },
        status: 401,
      }),
    );

    const resolve = createAccessTokenPrincipalResolver({
      audience: "https://api.o3o.app",
      fetchImpl: fetchMock as unknown as typeof fetch,
      findUserIdByKey: () => okAsync(null),
      issuer: "https://example.auth0.com",
      linkExternalIdentityToUserByEmail: vi.fn(),
    });

    const res = await resolve({ accessToken: "token" });

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe(
        integrationErrorCodes.OIDC_USERINFO_UNAUTHORIZED,
      );
    }
  });

  it("extractBearerToken returns missing-token error when authorization header is empty", () => {
    const res = extractBearerToken(undefined);
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe(authErrorCodes.AUTHORIZATION_HEADER_MISSING);
    }
  });

  it("extractBearerToken validates Bearer scheme", () => {
    const res = extractBearerToken("invalid-token-format");
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe(
        authErrorCodes.AUTHORIZATION_HEADER_MALFORMED,
      );
    }
  });

  it("authorizeScope accepts principal with required scope", () => {
    const result = authorizeScope(
      { scopes: ["transactions:read"], userId: "u-1" },
      "transactions:read",
    );
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual({
        scopes: ["transactions:read"],
        userId: "u-1",
      });
    }
  });

  it("authorizeScope rejects when principal is missing", () => {
    const result = authorizeScope(undefined, "transactions:read");
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(authErrorCodes.ACCESS_SCOPE_FORBIDDEN);
    }
  });

  it("authorizeScope rejects when scope is missing", () => {
    const result = authorizeScope(
      { scopes: ["transactions:write"], userId: "u-1" },
      "transactions:read",
    );
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.code).toBe(authErrorCodes.ACCESS_SCOPE_FORBIDDEN);
      expect(result.error.details?.reason).toBe(
        "Required scope is missing: transactions:read",
      );
    }
  });
});
