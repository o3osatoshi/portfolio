import { describe, expect, it } from "vitest";

import { trimTrailingSlash } from "./trim-trailing-slash";

describe("trimTrailingSlash", () => {
  it("removes a single trailing slash", () => {
    expect(trimTrailingSlash("https://x/")).toBe("https://x");
  });

  it("returns the value unchanged when it does not end with a slash", () => {
    expect(trimTrailingSlash("https://x")).toBe("https://x");
  });

  it("returns empty string unchanged", () => {
    expect(trimTrailingSlash("")).toBe("");
  });

  it("handles the single slash root value", () => {
    expect(trimTrailingSlash("/")).toBe("");
  });
});
