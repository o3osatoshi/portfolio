import { describe, expect, it } from "vitest";

import {
  composeErrorMessage,
  composeErrorName,
  parseErrorMessage,
  parseErrorName,
} from "./error-format";

describe("error-format name helpers", () => {
  it("composes layer and kind into the canonical suffix", () => {
    expect(composeErrorName("Domain", "Validation")).toBe(
      "DomainValidationError",
    );
  });

  it("parses both layer and kind when format matches", () => {
    expect(parseErrorName("InfraTimeoutError")).toEqual({
      kind: "Timeout",
      layer: "Infra",
    });
  });

  it("falls back gracefully when the kind portion is unknown", () => {
    expect(parseErrorName("UIWhateverError")).toEqual({ layer: "UI" });
    expect(parseErrorName("UnknownFormat")).toEqual({});
  });
});

describe("error-format message helpers", () => {
  it("serializes to a compact JSON document with a summary fallback", () => {
    const serialized = composeErrorMessage({
      causeText: "DB timeout",
      hint: "retry",
      impact: "no data returned",
      reason: "dependency unavailable",
    });
    const payload = JSON.parse(serialized);
    expect(payload["causeText"]).toBe("DB timeout");
    expect(payload["hint"]).toBe("retry");
    expect(payload["impact"]).toBe("no data returned");
    expect(payload["reason"]).toBe("dependency unavailable");
    expect(payload["summary"]).toBe("Operation failed");
    expect(payload["action"]).toBeUndefined();
  });

  it("parses structured fields from the JSON payload", () => {
    const serialized = composeErrorMessage({
      action: "SyncData",
      causeText: "ValidationError: Missing key",
      hint: "verify schema",
      impact: "nothing persisted",
      reason: "payload invalid",
    });
    const payload = JSON.parse(serialized);
    expect(payload["summary"]).toBe("SyncData failed");
    expect(parseErrorMessage(serialized)).toEqual({
      action: "SyncData",
      causeText: "ValidationError: Missing key",
      hint: "verify schema",
      impact: "nothing persisted",
      reason: "payload invalid",
    });
  });

  it("round-trips cleanly when composing then parsing", () => {
    const source = {
      action: "SyncLedger",
      causeText: "RPC timeout",
      hint: "retry",
      impact: "balances stale",
      reason: "dependency unavailable",
    };
    expect(parseErrorMessage(composeErrorMessage(source))).toEqual(source);
  });

  it("ignores unknown formats or malformed JSON", () => {
    expect(parseErrorMessage("Operation failed")).toEqual({});
    expect(parseErrorMessage("{not-valid-json")).toEqual({});
    expect(parseErrorMessage(undefined)).toEqual({});
  });
});
