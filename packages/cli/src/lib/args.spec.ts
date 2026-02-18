import { describe, expect, it } from "vitest";

import { hasFlag, parseArgs, readStringFlag } from "./args";

describe("lib/args", () => {
  it("parses positional and flags", () => {
    const parsed = parseArgs([
      "tx",
      "create",
      "--amount",
      "1.2",
      "--json",
      "--currency=USD",
    ]);

    expect(parsed.positionals).toEqual(["tx", "create"]);
    expect(readStringFlag(parsed, "amount")).toBe("1.2");
    expect(readStringFlag(parsed, "currency")).toBe("USD");
    expect(hasFlag(parsed, "json")).toBe(true);
  });
});
