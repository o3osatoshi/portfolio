import { describe, expect, it } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import type { Attributes } from "../types";
import { appendErrorAttributes } from "./error-attributes";

describe("appendErrorAttributes", () => {
  it("adds rich error metadata to provided attributes", () => {
    const attributes: Attributes = {};

    appendErrorAttributes(
      attributes,
      newRichError({
        code: "OIDC_TOKEN_INVALID",
        details: { reason: "token has expired" },
        isOperational: true,
        kind: "Unauthorized",
        layer: "External",
      }),
    );

    expect(attributes["error.code"]).toBe("OIDC_TOKEN_INVALID");
    expect(attributes["error.kind"]).toBe("Unauthorized");
    expect(attributes["error.layer"]).toBe("External");
    expect(attributes["error.reason"]).toBe("token has expired");
  });

  it("does nothing when error is undefined", () => {
    const attributes: Attributes = {};
    appendErrorAttributes(attributes, undefined);
    expect(Object.keys(attributes)).toHaveLength(0);
  });

  it("normalizes non-rich errors through RichError conversion", () => {
    const attributes: Attributes = {};
    appendErrorAttributes(attributes, new Error("boom"));
    expect(attributes["error.kind"]).toBe("Internal");
    expect(attributes["error.layer"]).toBe("External");
    expect(attributes["error.code"]).toBe("RICH_ERROR_NORMALIZED");
  });
});
