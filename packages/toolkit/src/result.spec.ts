import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

import { unwrapResultAsyncOrThrow } from "./result";

describe("unwrapResultAsyncOrThrow", () => {
  it("resolves the Ok value", async () => {
    const value = { ok: true, value: 42 };

    const result = await unwrapResultAsyncOrThrow(okAsync(value));

    expect(result).toEqual(value);
  });

  it("throws the Err error instance", async () => {
    const error = new Error("boom");

    await expect(unwrapResultAsyncOrThrow(errAsync(error))).rejects.toBe(error);
  });
});
