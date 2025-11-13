import { describe, expect, it } from "vitest";

import { truncate } from "./truncate";

describe("truncate", () => {
  it("returns original value when below max length", () => {
    expect(truncate("short", 10)).toBe("short");
  });

  it("truncates values that exceed the max length and appends ellipsis", () => {
    expect(truncate("truncate-me", 3)).toBe("tru…");
  });

  it("defaults the max length to 200 characters", () => {
    const value = "x".repeat(205);

    expect(truncate(value)).toBe(`${"x".repeat(200)}…`);
  });

  it("does not truncate when max is null", () => {
    const value = "x".repeat(205);
    expect(truncate(value, null)).toBe(value);
  });
});
