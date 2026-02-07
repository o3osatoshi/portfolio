import type {
  CacheStore,
  Transaction,
  TransactionRepository,
} from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { afterEach, describe, expect, it, vi } from "vitest";

import { newApplicationError } from "../../application-error";
import type { StepRunner } from "../../services";
import { generateStorePingContext, StorePingUseCase } from "./store-ping";

const testError = (reason: string) =>
  newApplicationError({
    details: {
      action: "StorePingUseCaseSpec",
      reason,
    },
    kind: "Internal",
  });

function makeCache(overrides: Partial<CacheStore> = {}): CacheStore {
  const base: CacheStore = {
    get: () => errAsync(testError("not implemented")),
    set: () => errAsync(testError("not implemented")),
  };
  return { ...base, ...overrides } as CacheStore;
}

function makeRepo(
  overrides: Partial<TransactionRepository> = {},
): TransactionRepository {
  const base: TransactionRepository = {
    create: () => errAsync(testError("not implemented")),
    delete: () => errAsync(testError("not implemented")),
    findById: () => errAsync(testError("not implemented")),
    findByUserId: () => errAsync(testError("not implemented")),
    update: () => errAsync(testError("not implemented")),
  };
  return { ...base, ...overrides } as TransactionRepository;
}

const baseDate = new Date("2024-02-01T00:00:00.000Z");
const baseContext = generateStorePingContext(baseDate);
const baseTransaction = {
  id: "tx-1",
  amount: "1",
  createdAt: baseDate,
  currency: "USD",
  datetime: baseDate,
  price: "1",
  type: "BUY",
  updatedAt: baseDate,
  userId: "user-1",
} as Transaction;

describe("StorePingUseCase", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("stores a transaction, updates cache, and returns a summary", async () => {
    const createMock = vi.fn(() => okAsync(baseTransaction));
    const findByIdMock = vi.fn(() => okAsync(baseTransaction));
    const deleteMock = vi.fn(() => okAsync<void>(undefined));
    const cacheGetMock = vi.fn(() => okAsync(null));
    const cacheSetMock = vi.fn(() => okAsync("OK"));
    const repo = makeRepo({
      create: createMock,
      delete: deleteMock,
      findById: findByIdMock,
    });
    // @ts-expect-error
    const cache = makeCache({ get: cacheGetMock, set: cacheSetMock });
    const useCase = new StorePingUseCase(repo, cache, "user-1");

    const stepIds: string[] = [];
    const step: StepRunner = (id, task) => {
      stepIds.push(id);
      return task();
    };

    vi.spyOn(Date, "now")
      .mockImplementationOnce(() => 1_000)
      .mockImplementationOnce(() => 1_250);

    const result = await useCase.execute(baseContext, step);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    expect(createMock).toHaveBeenCalledTimes(1);
    // @ts-expect-error
    expect(createMock.mock.calls[0]?.[0]).toMatchObject({
      userId: "user-1",
    });
    expect(findByIdMock).toHaveBeenCalledWith(baseTransaction.id);
    expect(deleteMock).toHaveBeenCalledWith(
      baseTransaction.id,
      baseTransaction.userId,
    );

    expect(cacheGetMock).toHaveBeenCalledWith("store-ping");
    expect(cacheSetMock).toHaveBeenCalledTimes(1);

    const [cacheKey, cacheValue, cacheOptions] = cacheSetMock.mock
      .calls[0] as unknown as [
      string,
      Array<{ runAt: string; runKey: string; slot: string; status: string }>,
      { ttlMs?: number } | undefined,
    ];
    expect(cacheKey).toBe("store-ping");
    expect(cacheOptions).toMatchObject({ ttlMs: 26 * 60 * 60 * 1_000 });
    expect(cacheValue).toHaveLength(1);
    expect(cacheValue[0]).toMatchObject({
      runAt: baseContext.runAt.toISOString(),
      runKey: baseContext.runKey,
      slot: baseContext.slot,
      status: "success",
    });

    expect(result.value).toMatchObject({
      cache: { key: "store-ping", size: 1 },
      db: {
        createdId: baseTransaction.id,
        deletedId: baseTransaction.id,
        readId: baseTransaction.id,
      },
      durationMs: 250,
      jobKey: baseContext.jobKey,
      runKey: baseContext.runKey,
      slot: baseContext.slot,
    });

    expect(stepIds).toEqual([
      "store-ping-db-create",
      "store-ping-db-read",
      "store-ping-db-delete",
      "store-ping-cache-get",
      "store-ping-cache-set",
    ]);
  });

  it("dedupes and trims cached entries", async () => {
    const createMock = vi.fn(() => okAsync(baseTransaction));
    const findByIdMock = vi.fn(() => okAsync(baseTransaction));
    const deleteMock = vi.fn(() => okAsync<void>(undefined));
    const existingEntries = [
      {
        runAt: "2024-01-31T12:00:00.000Z",
        runKey: "2024-01-31@12",
        slot: "12",
        status: "failure",
      },
      {
        runAt: "2024-01-31T00:00:00.000Z",
        runKey: "2024-01-31@00",
        slot: "00",
        status: "success",
      },
      {
        runAt: baseContext.runAt.toISOString(),
        runKey: baseContext.runKey,
        slot: baseContext.slot,
        status: "failure",
      },
      {
        runAt: "2024-01-30T00:00:00.000Z",
        runKey: "2024-01-30@00",
        slot: "00",
        status: "success",
      },
    ];
    const cacheGetMock = vi.fn(() => okAsync(existingEntries));
    const cacheSetMock = vi.fn(() => okAsync("OK"));
    const repo = makeRepo({
      create: createMock,
      delete: deleteMock,
      findById: findByIdMock,
    });
    // @ts-expect-error
    const cache = makeCache({ get: cacheGetMock, set: cacheSetMock });
    const useCase = new StorePingUseCase(repo, cache, "user-1");

    vi.spyOn(Date, "now")
      .mockImplementationOnce(() => 2_000)
      .mockImplementationOnce(() => 2_400);

    const result = await useCase.execute(baseContext);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    // @ts-expect-error
    const cachedEntries = cacheSetMock.mock.calls[0]?.[1] as unknown as Array<{
      runKey: string;
      status: string;
    }>;
    expect(cachedEntries).toHaveLength(3);
    expect(cachedEntries.map((entry) => entry.runKey)).toEqual([
      baseContext.runKey,
      "2024-01-31@12",
      "2024-01-31@00",
    ]);
    expect(cachedEntries[0]?.status).toBe("success");
    expect(result.value.cache.size).toBe(3);
  });

  it("returns ApplicationNotFoundError when readback is missing", async () => {
    const createMock = vi.fn(() => okAsync(baseTransaction));
    const findByIdMock = vi.fn(() => okAsync(null));
    const deleteMock = vi.fn(() => okAsync<void>(undefined));
    const cacheGetMock = vi.fn(() => okAsync(null));
    const cacheSetMock = vi.fn(() => okAsync("OK"));
    const repo = makeRepo({
      create: createMock,
      delete: deleteMock,
      findById: findByIdMock,
    });
    // @ts-expect-error
    const cache = makeCache({ get: cacheGetMock, set: cacheSetMock });
    const useCase = new StorePingUseCase(repo, cache, "user-1");

    const stepIds: string[] = [];
    const step: StepRunner = (id, task) => {
      stepIds.push(id);
      return task();
    };

    const result = await useCase.execute(baseContext, step);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error.name).toBe("ApplicationNotFoundError");
    expect(stepIds).toEqual(["store-ping-db-create", "store-ping-db-read"]);
    expect(deleteMock).not.toHaveBeenCalled();
    expect(cacheGetMock).not.toHaveBeenCalled();
    expect(cacheSetMock).not.toHaveBeenCalled();
  });

  it("generates run context with JST slots", () => {
    const morning = generateStorePingContext(
      new Date("2024-02-01T00:30:00.000Z"),
    );
    const afternoon = generateStorePingContext(
      new Date("2024-02-01T04:00:00.000Z"),
    );

    expect(morning.slot).toBe("00");
    expect(morning.runKey).toBe("2024-02-01@00");
    expect(afternoon.slot).toBe("12");
    expect(afternoon.runKey).toBe("2024-02-01@12");
  });
});
