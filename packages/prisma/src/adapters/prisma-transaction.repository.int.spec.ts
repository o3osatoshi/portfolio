import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  CreateTransaction,
  Transaction as DomainTransaction,
} from "@repo/domain";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import type { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let container: StartedPostgreSqlContainer | undefined;
let prisma: typeof import("../prisma-client")["prisma"] | undefined;
let repo:
  | import("./prisma-transaction.repository").PrismaTransactionRepository
  | undefined;

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
    const tx: CreateTransaction = {
      type: "BUY",
      datetime: new Date(),
      amount: 1,
      price: 10,
      currency: "USD",
      userId: "missing-user",
    };

    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");
    const res = await _repo.create(tx);
    expect(res.isErr()).toBe(true);
    const err = res._unsafeUnwrapErr();
    // Prisma's connect on missing relation -> P2025 -> NotFound
    expect(err.name).toBe("DBNotFoundError");
  });

  it("returns NotFound on update when user does not own the transaction", async () => {
    const _repo = repo;
    if (!_repo || !prisma) throw new Error("Repository not initialized");

    const created = (
      await _repo.create({
        type: "BUY",
        datetime: new Date(),
        amount: 2,
        price: 20,
        currency: "USD",
        userId: "user-1",
      })
    )._unsafeUnwrap();

    // Attempt to update with mismatched userId
    const toUpdate: DomainTransaction = {
      ...created,
      userId: "other-user",
      price: 21,
    };
    const res = await _repo.update(toUpdate);
    expect(res.isErr()).toBe(true);
    const err = res._unsafeUnwrapErr();
    expect(err.name).toBe("DBNotFoundError");
  });

  it("returns NotFound on delete when user does not own the transaction", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const createdRes = await _repo.create({
      type: "SELL",
      datetime: new Date(),
      amount: 3,
      price: 30,
      currency: "USD",
      userId: "user-1",
    });
    const created = createdRes._unsafeUnwrap();

    const res = await _repo.delete(created.id, "other-user");
    expect(res.isErr()).toBe(true);
    const err = res._unsafeUnwrapErr();
    expect(err.name).toBe("DBNotFoundError");
  });

  it("returns null on findById for missing id (non-error)", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");
    const res = await _repo.findById("tx-missing");
    expect(res.isOk()).toBe(true);
    expect(res._unsafeUnwrap()).toBeNull();
  });

  it("lists empty when user has no transactions (non-error)", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");
    const res = await _repo.findByUserId("no-tx-user");
    expect(res.isOk()).toBe(true);
    expect(res._unsafeUnwrap()).toEqual([]);
  });

  it("returns NotFound on update when id does not exist", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");
    const res = await _repo.update({
      id: "missing-id",
      type: "BUY",
      datetime: new Date(),
      amount: 1,
      price: 10,
      currency: "USD",
      userId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(res.isErr()).toBe(true);
    const err = res._unsafeUnwrapErr();
    expect(err.name).toBe("DBNotFoundError");
  });

  it("returns NotFound on delete when id does not exist", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");
    const res = await _repo.delete("missing-id", "user-1");
    expect(res.isErr()).toBe(true);
    const err = res._unsafeUnwrapErr();
    expect(err.name).toBe("DBNotFoundError");
  });

  it("returns Validation error when datetime is invalid", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");
    const invalid = {
      type: "BUY",
      // Intentionally invalid datetime
      datetime: "not-a-date" as unknown as Date,
      amount: 1,
      price: 10,
      currency: "USD",
      userId: "user-1",
    } satisfies Partial<CreateTransaction> as CreateTransaction;

    const res = await _repo.create(invalid);
    expect(res.isErr()).toBe(true);
    const err = res._unsafeUnwrapErr();
    expect(err.name).toBe("DBValidationError");
  });

  it("happy path: create, read, update, list, delete", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const base: CreateTransaction = {
      type: "BUY",
      datetime: new Date(),
      amount: 1.23,
      price: 100.5,
      currency: "USD",
      userId: "user-1",
    };

    const createdRes = await _repo.create(base);
    expect(createdRes.isOk()).toBe(true);
    const created = createdRes._unsafeUnwrap();

    const foundRes = await _repo.findById(created.id);
    expect(foundRes.isOk()).toBe(true);
    expect(foundRes._unsafeUnwrap()?.id).toBe(created.id);

    const updateRes = await _repo.update({ ...created, price: 101 });
    expect(updateRes.isOk()).toBe(true);

    const listRes = await _repo.findByUserId(base.userId);
    expect(listRes.isOk()).toBe(true);
    expect(listRes._unsafeUnwrap().length).toBeGreaterThanOrEqual(1);

    const deleteRes = await _repo.delete(created.id, base.userId);
    expect(deleteRes.isOk()).toBe(true);
  });

  it("findByUserId returns only own transactions", async () => {
    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");

    const beforeUser1 = (await _repo.findByUserId("user-1"))._unsafeUnwrap();

    const tx2: CreateTransaction = {
      type: "BUY",
      datetime: new Date(),
      amount: 5,
      price: 50,
      currency: "USD",
      userId: "user-2",
    };
    const create2 = await _repo.create(tx2);
    expect(create2.isOk()).toBe(true);

    const afterUser1 = (await _repo.findByUserId("user-1"))._unsafeUnwrap();
    expect(afterUser1.length).toBe(beforeUser1.length);
  });
});
