import { describe, expect, it, vi } from "vitest";

import { toTokenSetWithExpiry } from "./oidc-token-set";

describe("services/auth/oidc-token-set", () => {
  it("adds expires_at when expires_in is present", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);

    const tokenSet = toTokenSetWithExpiry({
      access_token: "access",
      expires_in: 3600,
      refresh_token: "refresh",
      scope: "openid profile",
      token_type: "Bearer",
    });

    expect(tokenSet.expires_at).toBe(1_700_000_000 + 3600);
    expect(tokenSet.refresh_token).toBe("refresh");
  });

  it("omits undefined optional fields", () => {
    const tokenSet = toTokenSetWithExpiry({
      access_token: "access",
    });

    expect(tokenSet).toEqual({
      access_token: "access",
    });
    expect("expires_at" in tokenSet).toBe(false);
    expect("refresh_token" in tokenSet).toBe(false);
    expect("scope" in tokenSet).toBe(false);
    expect("token_type" in tokenSet).toBe(false);
  });
});
