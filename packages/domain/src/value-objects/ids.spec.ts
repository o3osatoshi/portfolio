import { describe, it, expect } from "vitest";
import {
  isTransactionId,
  isUserId,
  newTransactionId,
  newUserId,
} from "./ids";

describe("value-objects/ids", () => {
  it("creates branded non-empty ids", () => {
    const t = newTransactionId("tx-1");
    const u = newUserId("user-1");
    expect(t.isOk()).toBe(true);
    expect(u.isOk()).toBe(true);
    if (t.isOk()) expect(isTransactionId(t.value)).toBe(true);
    if (u.isOk()) expect(isUserId(u.value)).toBe(true);
  });

  it("rejects empty strings", () => {
    const t = newTransactionId("");
    const u = newUserId("   ");
    expect(t.isErr()).toBe(true);
    expect(u.isErr()).toBe(true);
    if (t.isErr()) expect(t.error.name).toBe("DomainValidationError");
    if (u.isErr()) expect(u.error.name).toBe("DomainValidationError");
  });
});

