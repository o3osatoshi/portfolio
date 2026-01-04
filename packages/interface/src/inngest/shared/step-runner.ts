import type { StepRunner } from "@repo/application";
import { ResultAsync } from "neverthrow";

import {
  deserializeError,
  newError,
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
            newError({
              action: "InngestStepRunner",
              cause,
              kind: "Unknown",
              layer: "Infra",
              reason: "step.run rejected with a non-error value",
            }),
        }),
    ).map((value) => value as T);
}
