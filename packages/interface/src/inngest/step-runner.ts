import type { StepRunner } from "@repo/application";
import { ResultAsync } from "neverthrow";

import {
  deserializeError,
  newRichError,
  unwrapResultAsyncOrThrow,
} from "@o3osatoshi/toolkit";

type InngestStepRunner = {
  run: <T>(id: string, fn: () => Promise<T>) => Promise<unknown>;
};

export function createInngestStepRunner(step: InngestStepRunner): StepRunner {
  return <T>(id: string, task: () => ResultAsync<T, Error>) =>
    ResultAsync.fromPromise(
      step.run(id, () => unwrapResultAsyncOrThrow(task())),
      (error) =>
        deserializeError(error, {
          fallback: (cause) =>
            newRichError({
              cause,
              details: {
                action: "InngestStepRunner",
                reason: "step.run rejected with a non-error value",
              },
              kind: "Unknown",
              layer: "Infra",
            }),
        }),
    ).map((value) => value as T);
}
