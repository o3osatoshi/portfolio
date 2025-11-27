import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    sleepMock: vi.fn(),
  };
});

vi.mock("@o3osatoshi/toolkit", () => ({
  sleep: h.sleepMock,
}));

import type { HeavyProcessResponse } from "../../dtos/heavy-process.res.dto";
import { HeavyProcessUseCase } from "./heavy-process";

describe("application/use-cases: HeavyProcessUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.sleepMock.mockReset();
  });

  it("returns Ok with current timestamp when sleep completes", async () => {
    h.sleepMock.mockReturnValueOnce(okAsync<void, Error>(undefined as void));

    const useCase = new HeavyProcessUseCase();
    const before = new Date();

    const result = await useCase.execute();

    expect(h.sleepMock).toHaveBeenCalledTimes(1);
    expect(h.sleepMock.mock.calls[0]?.[0]).toBe(3_000);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    const payload: HeavyProcessResponse = result.value;
    expect(payload.timestamp).toBeInstanceOf(Date);
    expect(payload.timestamp.getTime()).toBeGreaterThanOrEqual(
      before.getTime(),
    );
  });

  it("propagates error when sleep fails", async () => {
    const sleepError = new Error("sleep interrupted");
    h.sleepMock.mockReturnValueOnce(errAsync<void, Error>(sleepError));

    const useCase = new HeavyProcessUseCase();

    const result = await useCase.execute();

    expect(h.sleepMock).toHaveBeenCalledTimes(1);
    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error).toBe(sleepError);
  });
});
