import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createTraceContext,
  formatTraceparent,
  parseTraceparent,
} from "./trace";

describe("trace", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it("derives context from traceparent", () => {
    const traceparent =
      "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01";

    const context = createTraceContext({ traceparent });

    expect(context.traceId).toBe("4bf92f3577b34da6a3ce929d0e0e4736");
    expect(context.parentSpanId).toBe("00f067aa0ba902b7");
    expect(context.traceFlags).toBe("01");
    expect(context.spanId).toHaveLength(16);
    expect(context.spanId).not.toBe("00f067aa0ba902b7");
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

  it("throws for invalid trace flags", () => {
    expect(() =>
      formatTraceparent(
        {
          spanId: "00f067aa0ba902b7",
          traceId: "4bf92f3577b34da6a3ce929d0e0e4736",
        },
        "zz",
      ),
    ).toThrow("traceparent flags must be a 2-character hex string");
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

  it("throws when crypto is unavailable", () => {
    vi.stubGlobal("crypto", undefined);

    expect(() => createTraceContext()).toThrow(
      "crypto.getRandomValues is required to generate trace/span identifiers",
    );
  });
});
