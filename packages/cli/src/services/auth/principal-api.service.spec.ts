import { err, ok, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import { accessTokenPrincipalSchema } from "./contracts/principal.schema";

const h = vi.hoisted(() => ({
  requestAuthedJsonMock: vi.fn(),
}));

vi.mock("../../common/http/authenticated-api-request", () => ({
  requestAuthedJson: (request: {
    decode?: {
      context: { action: string; layer?: string };
      schema: {
        safeParse: (input: unknown) => { data?: unknown; success: boolean };
      };
    };
    method?: string;
    path: string;
  }) =>
    h.requestAuthedJsonMock(request).andThen((json: unknown) => {
      if (!request.decode) {
        return ok(json);
      }

      const result = request.decode.schema.safeParse(json);
      if (result.success) {
        return ok(result.data);
      }

      return err(
        newRichError({
          code: "CLI_COMMAND_INVALID_ARGUMENT",
          details: {
            action: request.decode.context.action,
            reason: "Schema parsing failed.",
          },
          isOperational: true,
          kind: "Validation",
          layer: "Presentation",
        }),
      );
    }),
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
    expect(h.requestAuthedJsonMock).toHaveBeenCalledWith({
      decode: {
        context: {
          action: "DecodeAccessTokenPrincipalResponse",
          layer: "Presentation",
        },
        schema: accessTokenPrincipalSchema,
      },
      method: "GET",
      path: "/api/cli/v1/me",
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
