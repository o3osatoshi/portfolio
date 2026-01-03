import type { StepRunner } from "@repo/application";
import { ResultAsync } from "neverthrow";

type InngestStepRunner = {
  run: <T>(id: string, fn: () => Promise<T>) => Promise<unknown>;
};

export function createInngestStepRunner(step: InngestStepRunner): StepRunner {
  return <T>(id: string, task: () => ResultAsync<T, Error>) =>
    ResultAsync.fromPromise(
      step.run(id, () => unwrapResult(task())),
      normalizeError,
    ).map((value) => value as T);
}

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string" && error.length > 0) return new Error(error);
  return new Error("Unknown error");
}

async function unwrapResult<T>(result: ResultAsync<T, Error>): Promise<T> {
  return result.match(
    (value) => value,
    (error) => {
      throw error;
    },
  );
}
