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

  it("parses boolean flag when next token is another flag", () => {
    const parsed = parseArgs(["tx", "list", "--json", "--verbose"]);

    expect(hasFlag(parsed, "json")).toBe(true);
    expect(hasFlag(parsed, "verbose")).toBe(true);
    expect(readStringFlag(parsed, "json")).toBeUndefined();
  });

  it("keeps the latest value when same string flag appears multiple times", () => {
    const parsed = parseArgs([
      "tx",
      "create",
      "--currency",
      "USD",
      "--currency=JPY",
    ]);

    expect(readStringFlag(parsed, "currency")).toBe("JPY");
  });
});
