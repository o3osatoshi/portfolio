import { describe, expect, it } from "vitest";

import { newDomainError } from "./domain-error";
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
      isOperational: true,
      kind: "Conflict",
    });
    expect(err.name).toBe("DomainConflictError");
    expect(err.message).toContain("CreateTransaction failed");
    expect(err.message).toContain("duplicate id");
  });

  it("newDomainError supports Validation kind", () => {
    const err = newDomainError({
      code: domainErrorCodes.TRANSACTION_TYPE_INVALID,
      details: { action: "Parse", reason: "bad" },
      isOperational: true,
      kind: "Validation",
    });
    expect(err.name).toBe("DomainValidationError");
    expect(err.message).toContain("Parse failed");
  });
});
