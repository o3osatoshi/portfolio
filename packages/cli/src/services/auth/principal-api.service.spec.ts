import { okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  requestAuthedJsonMock: vi.fn(),
}));

vi.mock("../../common/http/authenticated-api-request", () => ({
  requestAuthedJson: (
    path: string,
    init: RequestInit,
    parser: (input: unknown) => ReturnType<typeof okAsync> | unknown,
  ) => h.requestAuthedJsonMock(path, init).andThen(parser),
  requestAuthenticatedApi: vi.fn(),
}));

describe("services/auth/principal-api.service", () => {
  beforeEach(() => {
    h.requestAuthedJsonMock.mockReset();
  });

  it("fetches and decodes principal response", async () => {
    h.requestAuthedJsonMock.mockReturnValueOnce(
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
    expect(h.requestAuthedJsonMock).toHaveBeenCalledWith("/api/cli/v1/me", {
      method: "GET",
    });
  });

  it("returns validation error when principal response shape is invalid", async () => {
    h.requestAuthedJsonMock.mockReturnValueOnce(
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
