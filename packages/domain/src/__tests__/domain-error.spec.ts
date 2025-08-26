import { describe, it, expect } from "vitest";
import {
  domainValidationError,
  newDomainError,
} from "../domain-error";

describe("domain-error", () => {
  it("newDomainError shapes name and message", () => {
    const err = newDomainError({
      kind: "Conflict",
      action: "CreateTransaction",
      reason: "duplicate id",
      hint: "use a new id",
    });
    expect(err.name).toBe("DomainConflictError");
    expect(err.message).toContain("CreateTransaction failed");
    expect(err.message).toContain("duplicate id");
  });

  it("domainValidationError helper sets kind Validation", () => {
    const err = domainValidationError({ action: "Parse", reason: "bad" });
    expect(err.name).toBe("DomainValidationError");
    expect(err.message).toContain("Parse failed");
  });
});

