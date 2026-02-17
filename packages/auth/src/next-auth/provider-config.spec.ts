import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  auth0Mock: vi.fn((options: Record<string, unknown>) => ({
    id: options["id"],
    type: "oidc",
  })),
}));

vi.mock("next-auth/providers/auth0", () => ({
  default: h.auth0Mock,
}));

describe("next-auth/provider config", () => {
  beforeEach(() => {
    vi.resetModules();
    h.auth0Mock.mockClear();
    vi.stubEnv("AUTH_OIDC_CLIENT_ID", "oidc-client-id");
    vi.stubEnv("AUTH_OIDC_CLIENT_SECRET", "oidc-client-secret");
    vi.stubEnv("AUTH_OIDC_ISSUER", "https://example.auth0.com");
  });

  it("wires OIDC env vars into Auth0 provider options", async () => {
    await import("./config");

    expect(h.auth0Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "oidc",
        allowDangerousEmailAccountLinking: false,
        clientId: "oidc-client-id",
        clientSecret: "oidc-client-secret",
        issuer: "https://example.auth0.com",
      }),
    );
  });
});
