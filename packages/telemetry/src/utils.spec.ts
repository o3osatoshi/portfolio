import { SeverityNumber } from "@opentelemetry/api-logs";
import { describe, expect, it } from "vitest";

import { toLogAttributes, toLogRecordSeverity } from "./utils";

describe("toLogAttributes", () => {
  it("returns undefined when attributes are missing", () => {
    expect(toLogAttributes(undefined)).toBeUndefined();
  });

  it("passes through attribute objects", () => {
    const attrs = {
      count: 123,
      foo: "bar",
      ok: true,
    } as const;

    expect(toLogAttributes(attrs)).toEqual(attrs);
  });

  it("strips undefined attribute values", () => {
    expect(
      toLogAttributes({
        foo: "bar",
        missing: undefined,
      }),
    ).toEqual({
      foo: "bar",
    });
  });
});

describe("toLogRecordSeverity", () => {
  it("maps severity labels to OpenTelemetry log severity fields", () => {
    expect(toLogRecordSeverity("debug")).toEqual({
      severityNumber: SeverityNumber.DEBUG,
      severityText: "DEBUG",
    });
    expect(toLogRecordSeverity("info")).toEqual({
      severityNumber: SeverityNumber.INFO,
      severityText: "INFO",
    });
    expect(toLogRecordSeverity("warn")).toEqual({
      severityNumber: SeverityNumber.WARN,
      severityText: "WARN",
    });
    expect(toLogRecordSeverity("error")).toEqual({
      severityNumber: SeverityNumber.ERROR,
      severityText: "ERROR",
    });
  });

  it("falls back to INFO for unexpected values", () => {
    expect(toLogRecordSeverity("unexpected" as never)).toEqual({
      severityNumber: SeverityNumber.INFO,
      severityText: "INFO",
    });
  });
});
