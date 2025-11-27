import { describe, expect, it } from "vitest";

import {
  heavyProcessCachedResponseSchema,
  heavyProcessResponseSchema,
} from "./heavy-process.res.dto";

describe("application/dtos: heavy-process.res.dto schemas", () => {
  it("parses a valid heavy process response", () => {
    const timestamp = new Date("2024-01-02T03:04:05Z");

    const result = heavyProcessResponseSchema.safeParse({ timestamp });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timestamp).toBeInstanceOf(Date);
      expect(result.data.timestamp.toISOString()).toBe(
        "2024-01-02T03:04:05.000Z",
      );
    }
  });

  it("fails to parse when timestamp is not a Date", () => {
    const result = heavyProcessResponseSchema.safeParse({
      timestamp: "2024-01-02T03:04:05Z",
    });

    expect(result.success).toBe(false);
  });

  it("parses a cached heavy process response with cached=true", () => {
    const timestamp = new Date("2025-01-01T00:00:00Z");

    const result = heavyProcessCachedResponseSchema.safeParse({
      cached: true,
      timestamp,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timestamp).toBeInstanceOf(Date);
      expect(result.data.cached).toBe(true);
    }
  });

  it("parses a cached heavy process response with cached=false", () => {
    const timestamp = new Date("2025-12-31T23:59:59Z");

    const result = heavyProcessCachedResponseSchema.safeParse({
      cached: false,
      timestamp,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.timestamp).toBeInstanceOf(Date);
      expect(result.data.cached).toBe(false);
    }
  });

  it("fails to parse cached response when cached flag is missing", () => {
    const timestamp = new Date();

    const result = heavyProcessCachedResponseSchema.safeParse({
      timestamp,
      // cached is intentionally omitted
    });

    expect(result.success).toBe(false);
  });
});
