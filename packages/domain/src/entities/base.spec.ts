import { describe, expect, it } from "vitest";

import { isDateTime } from "../value-objects";
import { newBase } from "./base";

describe("entities/base", () => {
  it("builds Base from valid datetimes", () => {
    const r = newBase({ createdAt: new Date(), updatedAt: new Date() });
    expect(r.isOk()).toBe(true);
    if (r.isOk()) {
      expect(isDateTime(r.value.createdAt)).toBe(true);
      expect(isDateTime(r.value.updatedAt)).toBe(true);
    }
  });

  it("fails when inputs are not Date", () => {
    const r = newBase({ createdAt: "x", updatedAt: new Date() });
    expect(r.isErr()).toBe(true);
  });
});
