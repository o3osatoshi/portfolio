import { describe, expect, it } from "vitest";

import { domainValidationError, newDomainError } from "./domain-error";
import { domainErrorCodes } from "./domain-error-catalog";

describe("domain-error", () => {
  it("newDomainError shapes name and message", () => {
    const err = newDomainError({
      code: domainErrorCodes.TRANSACTION_ID_MISMATCH,
      details: {
        action: "CreateTransaction",
        hint: "use a new id",
        reason: "duplicate id",
      },
      kind: "Conflict",
    });
    expect(err.name).toBe("DomainConflictError");
    expect(err.message).toContain("CreateTransaction failed");
    expect(err.message).toContain("duplicate id");
  });

  it("domainValidationError helper sets kind Validation", () => {
    const err = domainValidationError({
      code: domainErrorCodes.TRANSACTION_TYPE_INVALID,
      details: { action: "Parse", reason: "bad" },
    });
    expect(err.name).toBe("DomainValidationError");
    expect(err.message).toContain("Parse failed");
  });
});
