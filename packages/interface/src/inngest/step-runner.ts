import type { StepRunner } from "@repo/application";
import { ResultAsync } from "neverthrow";

import {
  type JsonValue,
  type RichError,
  toRichError,
  unwrapResultAsync,
} from "@o3osatoshi/toolkit";

type InngestStepRunner = {
  // Inngest serializes step outputs before returning them, so the boundary is
  // intentionally unknown here and narrowed at the StepRunner contract edge.
  run: <T extends JsonValue>(
    id: string,
    fn: () => Promise<T>,
  ) => Promise<unknown>;
};

/**
 * Adapt an Inngest `step` runner into `StepRunner` contract.
 *
 * `ResultAsync` failure values are converted into `RichError` through
 * `toRichError` and serialized/unwrapped to match the generic StepRunner
 * boundary.
 *
 * @param step Runner implementation provided by Inngest step runtime.
 * @returns Domain `StepRunner`.
 * @public
 */
export function createInngestStepRunner(step: InngestStepRunner): StepRunner {
  return <T extends JsonValue>(
    id: string,
    task: () => ResultAsync<T, RichError>,
  ) =>
    ResultAsync.fromPromise(
      step.run(id, () => unwrapResultAsync(task())),
      (error) =>
        toRichError(error, {
          details: {
            action: "InngestStepRunner",
            reason: "step.run rejected with an unexpected error value",
          },
          kind: "Internal",
          layer: "Infrastructure",
        }),
    ).map((value) => value as T);
}
