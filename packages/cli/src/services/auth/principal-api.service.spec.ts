import { okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  requestAuthenticatedApiMock: vi.fn(),
}));

vi.mock("../../common/http/authenticated-api-request", () => ({
  requestAuthenticatedApi: h.requestAuthenticatedApiMock,
}));

describe("services/auth/principal-api.service", () => {
  beforeEach(() => {
    h.requestAuthenticatedApiMock.mockReset();
  });

  it("fetches and decodes principal response", async () => {
    h.requestAuthenticatedApiMock.mockReturnValueOnce(
      okAsync({
        issuer: "https://example.auth0.com",
        scopes: ["transactions:read", "transactions:write"],
        subject: "auth0|123",
        userId: "user-1",
      }),
    );

    const { fetchAccessTokenPrincipal } = await import(
      "./principal-api.service"
    );
    const result = await fetchAccessTokenPrincipal();

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value).toEqual({
      issuer: "https://example.auth0.com",
      scopes: ["transactions:read", "transactions:write"],
      subject: "auth0|123",
      userId: "user-1",
    });
    expect(h.requestAuthenticatedApiMock).toHaveBeenCalledWith(
      "/api/cli/v1/me",
      {
        method: "GET",
      },
    );
  });

  it("returns validation error when principal response shape is invalid", async () => {
    h.requestAuthenticatedApiMock.mockReturnValueOnce(
      okAsync({
        issuer: "https://example.auth0.com",
      }),
    );

    const { fetchAccessTokenPrincipal } = await import(
      "./principal-api.service"
    );
    const result = await fetchAccessTokenPrincipal();

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.kind).toBe("Validation");
  });
});
