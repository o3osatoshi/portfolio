import { errAsync, ok, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    cacheLifeMock: vi.fn(),
    cacheTagMock: vi.fn(),
    createPrismaClientMock: vi.fn(),
    getUserIdMock: vi.fn(),
    parseGetTransactionsRequestMock: vi.fn(),
    prismaRepoCtorMock: vi.fn(),
    transactionsExecuteMock: vi.fn(),
  };
});

vi.mock("@/server/auth", () => ({
  getUserId: h.getUserIdMock,
}));

vi.mock("@repo/application", () => ({
  GetTransactionsUseCase: vi.fn(function GetTransactionsUseCaseMock(this: {
    execute: typeof h.transactionsExecuteMock;
  }) {
    this.execute = h.transactionsExecuteMock;
  }),
  parseGetTransactionsRequest: h.parseGetTransactionsRequestMock,
}));

vi.mock("@repo/prisma", () => ({
  createPrismaClient: h.createPrismaClientMock,
  PrismaTransactionRepository: vi.fn(function PrismaTransactionRepositoryMock(
    this: { client?: unknown },
    client: unknown,
  ) {
    h.prismaRepoCtorMock(client);
    this.client = client;
  }),
}));

vi.mock("next/cache", () => ({
  cacheLife: h.cacheLifeMock,
  cacheTag: h.cacheTagMock,
}));

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

vi.mock("@/env/server", () => ({
  env: {
    AUTH_SECRET: "test-secret",
    DATABASE_URL: "postgres://localhost/test",
  },
}));

import { getTag } from "@/utils/nav-handler";
import { webUnauthorizedError } from "@/utils/web-error";
import { newRichError } from "@o3osatoshi/toolkit";

import { getTransactions } from "./get-transactions";

const ONE_DAY_SECONDS = 60 * 60 * 24;
const ERROR_SECONDS = 60;

describe("getTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.createPrismaClientMock.mockReturnValue({});
  });

  it("returns Ok with serialized transactions and caches by tag", async () => {
    const now = new Date("2024-01-01T00:00:00.000Z");
    const userId = "u1";
    const response = [
      {
        id: "t1",
        amount: "1.0",
        createdAt: now,
        currency: "USD",
        datetime: now,
        price: "100.0",
        type: "BUY",
        updatedAt: now,
        userId,
      },
    ];

    h.getUserIdMock.mockReturnValueOnce(okAsync(userId));
    h.parseGetTransactionsRequestMock.mockReturnValueOnce(ok({ userId }));
    h.transactionsExecuteMock.mockReturnValueOnce(okAsync(response));

    const res = await getTransactions();

    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;

    expect(res.value[0]?.createdAt).toBe(now);
    expect(res.value[0]?.datetime).toBe(now);
    expect(res.value[0]?.updatedAt).toBe(now);

    const expectedTag = getTag("labs-transactions", { userId });
    expect(h.cacheTagMock).toHaveBeenCalledWith(expectedTag);
    expect(h.cacheLifeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        revalidate: ONE_DAY_SECONDS,
        expire: ONE_DAY_SECONDS,
      }),
    );
    expect(h.getUserIdMock).toHaveBeenCalledWith();
  });

  it("returns Err when token is missing", async () => {
    h.getUserIdMock.mockReturnValueOnce(
      errAsync(
        webUnauthorizedError({
          action: "DecodeAuthToken",
          reason: "Session token is missing a user id.",
        }),
      ),
    );

    const res = await getTransactions();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error.name).toBe("UIUnauthorizedError");
  });

  it("returns Err and uses short cache life when usecase fails", async () => {
    const userId = "u1";
    const error = newRichError({
      details: {
        action: "FindTransactionsByUserId",
        reason: "Database unavailable",
      },
      kind: "Unavailable",
      layer: "DB",
    });

    h.getUserIdMock.mockReturnValueOnce(okAsync(userId));
    h.parseGetTransactionsRequestMock.mockReturnValueOnce(ok({ userId }));
    h.transactionsExecuteMock.mockReturnValueOnce(errAsync(error));

    const res = await getTransactions();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error.name).toBe(error.name);
    expect(h.cacheLifeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        revalidate: ERROR_SECONDS,
        expire: ERROR_SECONDS,
      }),
    );
  });
});
