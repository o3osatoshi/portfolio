import { describe, expect, it } from "vitest";

import {
  createTraceContext,
  formatTraceparent,
  parseTraceparent,
} from "./trace";

describe("trace", () => {
  it("parses a valid traceparent", () => {
    const value = "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";

    const parsed = parseTraceparent(value);

    expect(parsed).toEqual({
      spanId: "00f067aa0ba902b7",
      traceFlags: "01",
      traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
    });
  });

  it("prefers explicit trace id when provided", () => {
    const context = createTraceContext({
      traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
    });

    expect(context.traceId).toBe("4bf92f3577b34da6a3ce929d0e0e4736");
    expect(context.spanId).toHaveLength(16);
  });

  it("formats traceparent headers", () => {
    const value = formatTraceparent({
      spanId: "00f067aa0ba902b7",
      traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
    });

    expect(value).toBe(
      "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
    );
  });

  it("returns undefined for invalid traceparent headers", () => {
    expect(parseTraceparent("")).toBeUndefined();
    expect(parseTraceparent("00-xyz")).toBeUndefined();
    expect(
      parseTraceparent(
        "00-00000000000000000000000000000000-0000000000000000-01",
      ),
    ).toBeUndefined();
  });
});
