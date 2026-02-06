import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

/**
 * Run a unit of work with a named step to enable external orchestration tooling
 * to track progress while preserving ResultAsync flows.
 */
export type StepRunner = <T>(
  id: string,
  task: () => ResultAsync<T, RichError>,
) => ResultAsync<T, RichError>;

/**
 * Default step runner for environments without orchestration.
 */
export const noopStepRunner: StepRunner = (_id, task) => task();
