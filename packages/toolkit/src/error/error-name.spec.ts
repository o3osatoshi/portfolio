import { describe, expect, it } from "vitest";

import { composeErrorName } from "./error-name";

describe("error name helpers", () => {
  it("composes names from layer + kind", () => {
    expect(composeErrorName("Domain", "Validation")).toBe(
      "DomainValidationError",
    );
  });
});
