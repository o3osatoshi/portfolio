import type { StepRunner } from "@repo/application";
import { ResultAsync } from "neverthrow";

import {
  type RichError,
  toRichError,
  unwrapResultAsyncOrThrow,
} from "@o3osatoshi/toolkit";

type InngestStepRunner = {
  run: <T>(id: string, fn: () => Promise<T>) => Promise<unknown>;
};

export function createInngestStepRunner(step: InngestStepRunner): StepRunner {
  return <T>(id: string, task: () => ResultAsync<T, RichError>) =>
    ResultAsync.fromPromise(
      step.run(id, () => unwrapResultAsyncOrThrow(task())),
      (error) =>
        toRichError(error, {
          details: {
            action: "InngestStepRunner",
            reason: "step.run rejected with an unexpected error value",
          },
          kind: "Unknown",
          layer: "Infra",
        }),
    ).map((value) => value as T);
}
