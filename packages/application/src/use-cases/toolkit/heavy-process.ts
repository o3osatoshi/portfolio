import type { ResultAsync } from "neverthrow";

import { sleep } from "@o3osatoshi/toolkit";

import type { HeavyProcessResponse } from "../../dtos/heavy-process.res.dto";

export class HeavyProcessUseCase {
  /**
   * Validate the inbound request, persist the transaction, and convert the
   * domain entity into a DTO-friendly response.
   *
   * @param req - Normalized request payload from the application layer.
   * @returns ResultAsync wrapping the created transaction DTO or a structured error.
   */
  execute(): ResultAsync<HeavyProcessResponse, Error> {
    return sleep(3_000).map(() => ({ timestamp: new Date() }));
  }
}
