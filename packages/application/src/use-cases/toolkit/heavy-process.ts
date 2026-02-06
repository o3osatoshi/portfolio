import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";
import { sleep } from "@o3osatoshi/toolkit";

import type { HeavyProcessResponse } from "../../dtos/heavy-process.res.dto";

export class HeavyProcessUseCase {
  /**
   * Simulate a heavy synchronous process and return a timestamp-only DTO.
   *
   * The implementation currently waits for 3 seconds and then resolves with
   * the current `Date` wrapped in {@link HeavyProcessResponse}.
   *
   * @returns ResultAsync wrapping a {@link HeavyProcessResponse} containing the
   * current timestamp, or an {@link Error} if the sleep operation fails.
   */
  execute(): ResultAsync<HeavyProcessResponse, RichError> {
    return sleep(3_000).map(() => ({ timestamp: new Date() }));
  }
}
