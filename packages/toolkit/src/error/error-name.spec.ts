import { describe, expect, it } from "vitest";

import { composeErrorName, parseErrorName } from "./error-name";

describe("error name helpers", () => {
  it("composes names from layer + kind", () => {
    expect(composeErrorName("Domain", "Validation")).toBe(
      "DomainValidationError",
    );
  });

  it("parses layer and kind from structured names", () => {
    expect(parseErrorName("InfraTimeoutError")).toEqual({
      kind: "Timeout",
      layer: "Infra",
    });
  });

  it("returns layer when kind is unknown", () => {
    expect(parseErrorName("UIWhateverError")).toEqual({ layer: "UI" });
  });

  it("returns empty when format is not recognized", () => {
    expect(parseErrorName("UnknownFormat")).toEqual({});
  });
});
