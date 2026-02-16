import type { ResultAsync } from "neverthrow";

import type { JsonValue, RichError } from "@o3osatoshi/toolkit";

/**
 * Run a unit of work with a named step to enable external orchestration tooling
 * to track progress while preserving ResultAsync flows.
 *
 * @remarks
 * Durable orchestration runtimes persist and replay step boundaries, so step
 * results are intentionally limited to JSON-compatible values.
 */
export type StepRunner = <T extends JsonValue>(
  id: string,
  task: () => ResultAsync<T, RichError>,
) => ResultAsync<T, RichError>;

/**
 * Default step runner for environments without orchestration.
 */
export const noopStepRunner: StepRunner = (_id, task) => task();
