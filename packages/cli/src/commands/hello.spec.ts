import { describe, expect, it, vi } from "vitest";

import { runHello } from "./hello";

describe("commands/hello", () => {
  it("prints hello world", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runHello();

    expect(logSpy).toHaveBeenCalledWith("hello world");
  });
});
