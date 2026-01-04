import type { ResultAsync } from "neverthrow";

/**
 * Run a unit of work with a named step to enable external orchestration tooling
 * to track progress while preserving ResultAsync flows.
 */
export type StepRunner = <T>(
  id: string,
  task: () => ResultAsync<T, Error>,
) => ResultAsync<T, Error>;

/**
 * Default step runner for environments without orchestration.
 */
export const noopStepRunner: StepRunner = (_id, task) => task();
