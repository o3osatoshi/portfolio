import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CreateTransaction, Transaction } from "@repo/domain";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TestHelpers, expectOk } from "../test-utils";
import type { PrismaTransactionRepository } from "./prisma-transaction.repository";

let container: StartedPostgreSqlContainer | undefined;
let prisma: typeof import("../prisma-client")["prisma"] | undefined;
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

    process.env.DATABASE_URL = container.getConnectionUri();
    execSync("npx prisma db push --skip-generate", {
      cwd: pkgRoot,
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });

    prisma = (await import("../prisma-client")).prisma;
    const { PrismaTransactionRepository } = await import(
      "./prisma-transaction.repository"
    );
    repo = new PrismaTransactionRepository();

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
    const tx = TestHelpers.createValidTransaction({
      amount: "1",
      price: "10",
      currency: "USD",
      userId: "missing-user",
    });

    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const res = await _repo.create(tx);

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBNotFoundError");
    }
  });

  it("returns NotFound on update when user does not own the transaction", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const tx = TestHelpers.createValidTransaction({
      type: "BUY",
      amount: "2",
      price: "20",
      currency: "USD",
      userId: "user-1",
    });

    const createRes = await _repo.create(tx);
    const created = expectOk(createRes);

    // Attempt to update with mismatched userId
    const updateTx: Transaction = {
      ...created,
      userId: TestHelpers.makeUserId("other-user"),
      price: TestHelpers.makePrice("21"),
    };

    const res = await _repo.update(updateTx);

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBNotFoundError");
    }
  });

  it("returns NotFound on delete when user does not own the transaction", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const tx = TestHelpers.createValidTransaction({
      type: "SELL",
      amount: "3",
      price: "30",
      currency: "USD",
      userId: "user-1",
    });

    const createRes = await _repo.create(tx);
    const createTx = expectOk(createRes);

    const res = await _repo.delete(
      createTx.id,
      TestHelpers.makeUserId("other-user"),
    );

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBNotFoundError");
    }
  });

  it("returns null on findById for missing id (non-error)", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const res = await _repo.findById(
      TestHelpers.makeTransactionId("tx-missing"),
    );

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value).toBeNull();
    }
  });

  it("lists empty when user has no transactions (non-error)", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const res = await _repo.findByUserId(TestHelpers.makeUserId("no-tx-user"));

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value).toEqual([]);
    }
  });

  it("returns NotFound on update when id does not exist", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const tx: Transaction = {
      id: TestHelpers.makeTransactionId("missing-id"),
      type: TestHelpers.makeTransactionType("BUY"),
      datetime: TestHelpers.makeDateTime(new Date()),
      amount: TestHelpers.makeAmount("1"),
      price: TestHelpers.makePrice("10"),
      currency: TestHelpers.makeCurrencyCode("USD"),
      userId: TestHelpers.makeUserId("user-1"),
      createdAt: TestHelpers.makeDateTime(new Date()),
      updatedAt: TestHelpers.makeDateTime(new Date()),
    };

    const res = await _repo.update(tx);

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBNotFoundError");
    }
  });

  it("returns NotFound on delete when id does not exist", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const res = await _repo.delete(
      TestHelpers.makeTransactionId("missing-id"),
      TestHelpers.makeUserId("user-1"),
    );

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBNotFoundError");
    }
  });

  it("returns Validation error when datetime is invalid", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    // Create invalid transaction with bad datetime
    const invalidTx = {
      type: TestHelpers.makeTransactionType("BUY"),
      // Intentionally invalid datetime
      datetime: "not-a-date" as unknown as import("@repo/domain").DateTime,
      amount: TestHelpers.makeAmount("1"),
      price: TestHelpers.makePrice("10"),
      currency: TestHelpers.makeCurrencyCode("USD"),
      userId: TestHelpers.makeUserId("user-1"),
    } satisfies Partial<CreateTransaction> as CreateTransaction;

    const res = await _repo.create(invalidTx);

    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("DBValidationError");
    }
  });

  it("happy path: create, read, update, list, delete", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const tx = TestHelpers.createValidTransaction({
      type: "BUY",
      amount: "1.23",
      price: "100.5",
      currency: "USD",
      userId: "user-1",
    });

    const createRes = await _repo.create(tx);
    expect(createRes.isOk()).toBe(true);
    const createTx = expectOk(createRes);

    const findRes = await _repo.findById(createTx.id);
    expect(findRes.isOk()).toBe(true);
    if (findRes.isOk()) {
      expect(findRes.value?.id).toBe(createTx.id);
    }

    const updateRes = await _repo.update({
      ...createTx,
      price: TestHelpers.makePrice("101"),
    });
    expect(updateRes.isOk()).toBe(true);

    const listRes = await _repo.findByUserId(tx.userId);
    expect(listRes.isOk()).toBe(true);
    if (listRes.isOk()) {
      expect(listRes.value.length).toBeGreaterThanOrEqual(1);
    }

    const deleteRes = await _repo.delete(createTx.id, tx.userId);
    expect(deleteRes.isOk()).toBe(true);
  });

  it("findByUserId returns only own transactions", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const beforeFindRes = await _repo.findByUserId(
      TestHelpers.makeUserId("user-1"),
    );
    const beforeTxs = expectOk(beforeFindRes);

    const tx = TestHelpers.createValidTransaction({
      type: "BUY",
      amount: "5",
      price: "50",
      currency: "USD",
      userId: "user-2",
    });

    const createRes = await _repo.create(tx);
    expect(createRes.isOk()).toBe(true);

    const afterFindRes = await _repo.findByUserId(
      TestHelpers.makeUserId("user-1"),
    );
    const afterTxs = expectOk(afterFindRes);

    expect(afterTxs.length).toBe(beforeTxs.length);
  });
});
