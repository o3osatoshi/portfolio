import { describe, expect, it, vi } from "vitest";

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

import { findNavs, getPath, getTag } from "./nav-handler";

describe("utils/nav-handler findNavs", () => {
  it("returns breadcrumb chain for nested web route", () => {
    const navs = findNavs("/labs/server-crud");
    expect(navs).toBeDefined();
    if (!navs) return;

    expect(navs.map((n) => n.alias)).toEqual(["labs", "labs-server-crud"]);
  });

  it("returns undefined for unknown path", () => {
    const navs = findNavs("/unknown");
    expect(navs).toBeUndefined();
  });

  it("returns undefined for api-only paths", () => {
    expect(findNavs("/api/private/labs/transactions")).toBeUndefined();
    expect(findNavs("/edge/private/me")).toBeUndefined();
  });
});

describe("utils/nav-handler getPath", () => {
  it("returns path for web alias", () => {
    expect(getPath("labs-server-crud")).toBe("/labs/server-crud");
  });

  it("returns path for api alias", () => {
    expect(getPath("me")).toBe("/edge/private/me");
  });

  it("throws for unknown alias", () => {
    expect(() => getPath("unknown" as never)).toThrowError("alias not found");
  });
});

describe("utils/nav-handler getTag", () => {
  it("returns path-only tag when search is omitted", () => {
    const tag = getTag("labs-transactions");
    expect(tag).toBe("/api/private/labs/transactions");
  });

  it("includes query params in tag when search is provided", () => {
    const tag = getTag("labs-transactions", { page: "1", userId: "u1" });
    const url = new URL(tag, "https://example.com");

    expect(url.pathname).toBe("/api/private/labs/transactions");
    expect(url.searchParams.get("userId")).toBe("u1");
    expect(url.searchParams.get("page")).toBe("1");
  });
});
