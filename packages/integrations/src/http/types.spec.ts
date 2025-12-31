import { describe, expect, it } from "vitest";

import { mergeMeta } from "./types";

describe("integrations/http mergeMeta", () => {
  it("merges and overrides metadata", () => {
    const base = { attempts: 1, cacheHit: true };
    const extra = { cacheHit: false, cacheKey: "cache:key" };
    expect(mergeMeta(base, extra)).toEqual({
      attempts: 1,
      cacheHit: false,
      cacheKey: "cache:key",
    });
  });

  it("returns base when extra is undefined", () => {
    const base = { attempts: 2 };
    expect(mergeMeta(base)).toEqual({ attempts: 2 });
  });
});
