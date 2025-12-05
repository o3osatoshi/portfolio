import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type {
  Amount,
  CreateTransaction,
  CurrencyCode,
  DateTime,
  Fee,
  Price,
  ProfitLoss,
  Transaction,
  TransactionId,
  TransactionType,
  UserId,
} from "@repo/domain";
import {
  newAmount,
  newCurrencyCode,
  newDateTime,
  newFee,
  newPrice,
  newProfitLoss,
  newTransactionId,
  newTransactionType,
  newUserId,
} from "@repo/domain";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { Result } from "neverthrow";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { PrismaTransactionRepository } from "./prisma-transaction.repository";

let container: StartedPostgreSqlContainer | undefined;
let prisma: import("../prisma-client").PrismaClient | undefined;
let repo: PrismaTransactionRepository | undefined;

const pkgRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../",
);

describe("PrismaTransactionRepository (integration with Testcontainers)", () => {
  beforeAll(async () => {
    try {
      execSync("docker info", { stdio: "ignore" });
    } catch {
      throw new Error(
        "Docker runtime not available. Ensure Docker daemon is running.",
      );
    }

    try {
      container = await new PostgreSqlContainer("postgres:16-alpine")
        .withDatabase("postgres")
        .withUsername("postgres")
        .withPassword("postgres")
        .start();
    } catch (e) {
      throw new Error(
        `Failed to start PostgreSQL test container: ${
          e instanceof Error ? e.message : String(e)
        }`,
      );
    }

    process.env["DATABASE_URL"] = container.getConnectionUri();
    execSync("npx prisma db push", {
      cwd: pkgRoot,
      env: { ...process.env, DATABASE_URL: process.env["DATABASE_URL"] },
      stdio: "inherit",
    });

    const { createPrismaClient } = await import("../prisma-client");
    prisma = createPrismaClient({
      connectionString: process.env["DATABASE_URL"],
    });
    const { PrismaTransactionRepository } = await import(
      "./prisma-transaction.repository"
    );
    repo = new PrismaTransactionRepository(prisma);

    // Seed an existing user for ownership tests
    await prisma.user.create({
      data: { id: "user-1", email: "user1@example.com" },
    });
    await prisma.user.create({
      data: { id: "user-2", email: "user2@example.com" },
    });
  }, 60_000);

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (container) await container.stop();
  }, 60_000);

  it("fails to create when user does not exist (NotFound via connect)", async () => {
    if (!repo) throw new Error("Repository not initialized");

    const tx = TestHelpers.createValidTransaction({
      amount: "1",
      currency: "USD",
      price: "10",
      userId: "missing-user",
    });

    const res = await repo.create(tx);

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBNotFoundError");
    }
  });

  it("returns NotFound on update when user does not own the transaction", async () => {
    if (!repo) throw new Error("Repository not initialized");

    const tx = TestHelpers.createValidTransaction({
      amount: "2",
      currency: "USD",
      price: "20",
      type: "BUY",
      userId: "user-1",
    });

    const createRes = await repo.create(tx);
    const created = expectOk(createRes);

    // Attempt to update with mismatched userId
    const updateTx: Transaction = {
      ...created,
      price: TestHelpers.newPrice("21"),
      userId: TestHelpers.newUserId("other-user"),
    };

    const res = await repo.update(updateTx);

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBNotFoundError");
    }
  });

  it("returns NotFound on delete when user does not own the transaction", async () => {
    if (!repo) throw new Error("Repository not initialized");

    const tx = TestHelpers.createValidTransaction({
      amount: "3",
      currency: "USD",
      price: "30",
      type: "SELL",
      userId: "user-1",
    });

    const createRes = await repo.create(tx);
    const createTx = expectOk(createRes);

    const res = await repo.delete(
      createTx.id,
      TestHelpers.newUserId("other-user"),
    );

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBNotFoundError");
    }
  });

  it("returns null on findById for missing id (non-error)", async () => {
    if (!repo) throw new Error("Repository not initialized");

    const res = await repo.findById(TestHelpers.newTransactionId("tx-missing"));

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value).toBeNull();
    }
  });

  it("lists empty when user has no transactions (non-error)", async () => {
    if (!repo) throw new Error("Repository not initialized");

    const res = await repo.findByUserId(TestHelpers.newUserId("no-tx-user"));

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value).toEqual([]);
    }
  });

  it("returns NotFound on update when id does not exist", async () => {
    if (!repo) throw new Error("Repository not initialized");

    const tx: Transaction = {
      id: TestHelpers.newTransactionId("missing-id"),
      amount: TestHelpers.newAmount("1"),
      createdAt: TestHelpers.newDateTime(new Date()),
      currency: TestHelpers.newCurrencyCode("USD"),
      datetime: TestHelpers.newDateTime(new Date()),
      price: TestHelpers.newPrice("10"),
      type: TestHelpers.newTransactionType("BUY"),
      updatedAt: TestHelpers.newDateTime(new Date()),
      userId: TestHelpers.newUserId("user-1"),
    };

    const res = await repo.update(tx);

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBNotFoundError");
    }
  });

  it("returns NotFound on delete when id does not exist", async () => {
    if (!repo) throw new Error("Repository not initialized");

    const res = await repo.delete(
      TestHelpers.newTransactionId("missing-id"),
      TestHelpers.newUserId("user-1"),
    );

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBNotFoundError");
    }
  });

  it("returns Validation error when datetime is invalid", async () => {
    if (!repo) throw new Error("Repository not initialized");

    // Create invalid transaction with bad datetime
    const invalidTx = {
      amount: TestHelpers.newAmount("1"),
      currency: TestHelpers.newCurrencyCode("USD"),
      // Intentionally invalid datetime
      datetime: "not-a-date" as unknown as import("@repo/domain").DateTime,
      price: TestHelpers.newPrice("10"),
      type: TestHelpers.newTransactionType("BUY"),
      userId: TestHelpers.newUserId("user-1"),
    } satisfies Partial<CreateTransaction> as CreateTransaction;

    const res = await repo.create(invalidTx);

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBValidationError");
    }
  });

  it("happy path: create, read, update, list, delete", async () => {
    if (!repo) throw new Error("Repository not initialized");

    const tx = TestHelpers.createValidTransaction({
      amount: "1.23",
      currency: "USD",
      price: "100.5",
      type: "BUY",
      userId: "user-1",
    });

    const createRes = await repo.create(tx);
    expect(createRes.isOk()).toBe(true);
    const createTx = expectOk(createRes);

    const findRes = await repo.findById(createTx.id);
    expect(findRes.isOk()).toBe(true);
    if (findRes.isOk()) {
      expect(findRes.value?.id).toBe(createTx.id);
    }

    const updateRes = await repo.update({
      ...createTx,
      price: TestHelpers.newPrice("101"),
    });
    expect(updateRes.isOk()).toBe(true);

    const listRes = await repo.findByUserId(tx.userId);
    expect(listRes.isOk()).toBe(true);
    if (listRes.isOk()) {
      expect(listRes.value.length).toBeGreaterThanOrEqual(1);
    }

    const deleteRes = await repo.delete(createTx.id, tx.userId);
    expect(deleteRes.isOk()).toBe(true);
  });

  it("findByUserId returns only own transactions", async () => {
    if (!repo) throw new Error("Repository not initialized");

    const beforeFindRes = await repo.findByUserId(
      TestHelpers.newUserId("user-1"),
    );
    const beforeTxs = expectOk(beforeFindRes);

    const tx = TestHelpers.createValidTransaction({
      amount: "5",
      currency: "USD",
      price: "50",
      type: "BUY",
      userId: "user-2",
    });

    const createRes = await repo.create(tx);
    expect(createRes.isOk()).toBe(true);

    const afterFindRes = await repo.findByUserId(
      TestHelpers.newUserId("user-1"),
    );
    const afterTxs = expectOk(afterFindRes);

    expect(afterTxs.length).toBe(beforeTxs.length);
  });
});

// biome-ignore lint/complexity/noStaticOnlyClass: allow only static members since this is a test class
class TestHelpers {
  static createValidTransaction(
    overrides: Partial<{
      amount: string;
      currency: string;
      datetime: Date;
      fee?: string;
      feeCurrency?: string;
      price: string;
      profitLoss?: string;
      type: "BUY" | "SELL";
      userId: string;
    }> = {},
  ): CreateTransaction {
    const defaults = {
      amount: "1.0",
      currency: "USD",
      datetime: new Date(),
      price: "100.0",
      type: "BUY" as const,
      userId: "test-user-1",
    };

    const merged = { ...defaults, ...overrides };

    return {
      amount: expectOk(newAmount(merged.amount)),
      currency: expectOk(newCurrencyCode(merged.currency)),
      datetime: expectOk(newDateTime(merged.datetime)),
      fee: merged.fee ? expectOk(newFee(merged.fee)) : undefined,
      feeCurrency: merged.feeCurrency
        ? expectOk(newCurrencyCode(merged.feeCurrency))
        : undefined,
      price: expectOk(newPrice(merged.price)),
      profitLoss: merged.profitLoss
        ? expectOk(newProfitLoss(merged.profitLoss))
        : undefined,
      type: expectOk(newTransactionType(merged.type)),
      userId: expectOk(newUserId(merged.userId)),
    };
  }

  static newAmount(amount: string): Amount {
    return expectOk(newAmount(amount));
  }

  static newCurrencyCode(currency: string): CurrencyCode {
    return expectOk(newCurrencyCode(currency));
  }

  static newDateTime(date: Date): DateTime {
    return expectOk(newDateTime(date));
  }

  static newFee(fee: string): Fee {
    return expectOk(newFee(fee));
  }

  static newPrice(price: string): Price {
    return expectOk(newPrice(price));
  }

  static newProfitLoss(profitLoss: string): ProfitLoss {
    return expectOk(newProfitLoss(profitLoss));
  }

  static newTransactionId(id: string): TransactionId {
    return expectOk(newTransactionId(id));
  }

  static newTransactionType(type: "BUY" | "SELL"): TransactionType {
    return expectOk(newTransactionType(type));
  }

  static newUserId(id: string): UserId {
    return expectOk(newUserId(id));
  }
}

function expectOk<T, E>(result: Result<T, E>): T {
  if (result.isErr()) {
    throw new Error(`Expected Ok but got Err: ${result.error}`);
  }
  return result.value;
}
