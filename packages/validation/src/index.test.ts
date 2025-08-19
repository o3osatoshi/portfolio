import { describe, expect, it } from "vitest";
import { validateUser } from "./index";

describe("validateUser", () => {
  it("parses a valid user", () => {
    expect(validateUser({ id: "1", email: "a@b.com" }).id).toBe("1");
  });
});
