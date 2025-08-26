import { describe, it, expect } from "vitest";
import * as domain from "../index";

describe("index exports", () => {
  it("re-exports value-objects and entities", () => {
    expect(typeof domain.newAmount).toBe("function");
    expect(typeof domain.createTransaction).toBe("function");
  });
});

