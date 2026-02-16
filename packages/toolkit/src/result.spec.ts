import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

import { newRichError } from "./error";
import { unwrapResultAsync } from "./result";

describe("unwrapResultAsync", () => {
  it("resolves the Ok value", async () => {
    const value = { ok: true, value: 42 };

    const result = await unwrapResultAsync(okAsync(value));

    expect(result).toEqual(value);
  });

  it("throws the Err error instance", async () => {
    const error = newRichError({
      details: { reason: "boom" },
      isOperational: false,
      kind: "Internal",
      layer: "External",
    });

    await expect(unwrapResultAsync(errAsync(error))).rejects.toBe(error);
  });
});
