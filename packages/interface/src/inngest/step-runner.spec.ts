import { okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

import type { JsonValue } from "@o3osatoshi/toolkit";

import { createInngestStepRunner } from "./step-runner";

describe("interface/inngest createInngestStepRunner", () => {
  it("returns the step result without type assertions", async () => {
    const stepCalls: string[] = [];
    const step = {
      run: async <T extends JsonValue>(
        id: string,
        fn: () => Promise<T>,
      ): Promise<T> => {
        stepCalls.push(id);
        return fn();
      },
    };
    const runner = createInngestStepRunner(step);

    const result = await runner("store-ping", () => okAsync("ok"));

    expect(stepCalls).toEqual(["store-ping"]);
    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;
    expect(result.value).toBe("ok");
  });

  it("normalizes step.run rejections to RichError", async () => {
    const step = {
      run: async <T extends JsonValue>(
        _id: string,
        _fn: () => Promise<T>,
      ): Promise<T> => {
        throw new Error("step failed");
      },
    };
    const runner = createInngestStepRunner(step);

    const result = await runner("store-ping", () => okAsync("ok"));

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;
    expect(result.error.kind).toBe("Internal");
    expect(result.error.layer).toBe("Infrastructure");
    expect(result.error.details?.action).toBe("InngestStepRunner");
    expect(result.error.details?.reason).toBe(
      "step.run rejected with an unexpected error value",
    );
  });
});
