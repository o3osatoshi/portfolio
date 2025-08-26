import { describe, it, expect } from "vitest";
import { isDateTime, newDateTime } from "./datetime";

describe("value-objects/datetime", () => {
  it("accepts valid Date and brands it", () => {
    const r = newDateTime(new Date());
    expect(r.isOk()).toBe(true);
    if (r.isOk()) {
      expect(isDateTime(r.value)).toBe(true);
    }
  });

  it("rejects non-Date inputs and invalid Date", () => {
    const notDate = newDateTime("2024-01-01" as unknown);
    const invalid = newDateTime(new Date("invalid"));
    expect(notDate.isErr()).toBe(true);
    expect(invalid.isErr()).toBe(true);
    if (notDate.isErr()) expect(notDate.error.name).toBe("DomainValidationError");
    if (invalid.isErr()) expect(invalid.error.name).toBe("DomainValidationError");
  });
});

