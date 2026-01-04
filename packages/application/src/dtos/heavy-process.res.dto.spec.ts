import { describe, expect, it } from "vitest";

import { parseWith } from "@o3osatoshi/toolkit";

import {
  heavyProcessCachedResponseSchema,
  heavyProcessResponseSchema,
} from "./heavy-process.res.dto";

const parseHeavyProcessResponse = parseWith(heavyProcessResponseSchema, {
  action: "ParseHeavyProcessResponse",
});
const parseHeavyProcessCachedResponse = parseWith(
  heavyProcessCachedResponseSchema,
  {
    action: "ParseHeavyProcessCachedResponse",
  },
);

describe("application/dtos: heavy-process.res.dto schemas", () => {
  it("parses a valid heavy process response", () => {
    const timestamp = new Date("2024-01-02T03:04:05Z");

    const result = parseHeavyProcessResponse({ timestamp });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.timestamp).toBeInstanceOf(Date);
      expect(result.value.timestamp.toISOString()).toBe(
        "2024-01-02T03:04:05.000Z",
      );
    }
  });

  it("fails to parse when timestamp is not a Date", () => {
    const result = parseHeavyProcessResponse({
      timestamp: "2024-01-02T03:04:05Z",
    });

    expect(result.isErr()).toBe(true);
  });

  it("parses a cached heavy process response with cached=true", () => {
    const timestamp = new Date("2025-01-01T00:00:00Z");

    const result = parseHeavyProcessCachedResponse({
      cached: true,
      timestamp,
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.timestamp).toBeInstanceOf(Date);
      expect(result.value.cached).toBe(true);
    }
  });

  it("parses a cached heavy process response with cached=false", () => {
    const timestamp = new Date("2025-12-31T23:59:59Z");

    const result = parseHeavyProcessCachedResponse({
      cached: false,
      timestamp,
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.timestamp).toBeInstanceOf(Date);
      expect(result.value.cached).toBe(false);
    }
  });

  it("fails to parse cached response when cached flag is missing", () => {
    const timestamp = new Date();

    const result = parseHeavyProcessCachedResponse({
      timestamp,
      // cached is intentionally omitted
    });

    expect(result.isErr()).toBe(true);
  });
});
