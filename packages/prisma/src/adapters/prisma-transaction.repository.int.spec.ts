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

describe("TransactionRepository (integration with Testcontainers)", () => {
  beforeAll(async () => {
    // Fail fast when Docker is unavailable
    try {
      execSync("docker info", { stdio: "ignore" });
    } catch {
      throw new Error(
        "Docker runtime not available. Ensure Docker Desktop/daemon is running.",
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

    await prisma.user.create({
      data: { id: "user-1", email: "user1@example.com" },
    });
  }, 60_000);

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
    if (container) await container.stop();
  }, 60_000);

  it("creates, reads, updates, lists, and deletes a transaction", async () => {
    const base: CreateTransaction = {
      type: "BUY",
      datetime: new Date(),
      amount: 1.23,
      price: 100.5,
      currency: "USD",
      userId: "user-1",
    };

    const _repo = repo;
    if (!_repo) throw new Error("Repository not initialized");
    const createdRes = await _repo.create(base);
    expect(createdRes.isOk()).toBe(true);
    const created = createdRes._unsafeUnwrap();
    expect(created.id).toBeTruthy();

    const foundRes = await _repo.findById(created.id);
    expect(foundRes.isOk()).toBe(true);
    const found = foundRes._unsafeUnwrap();
    expect(found?.id).toBe(created.id);
    expect(found?.userId).toBe(base.userId);

    const updated: DomainTransaction = { ...created, price: 101.0 };
    const updateRes = await _repo.update(updated);
    expect(updateRes.isOk()).toBe(true);

    const listRes = await _repo.findByUserId(base.userId);
    expect(listRes.isOk()).toBe(true);
    const list = listRes._unsafeUnwrap();
    expect(list.length).toBeGreaterThanOrEqual(1);

    const delRes = await _repo.delete(created.id, base.userId);
    expect(delRes.isOk()).toBe(true);

    const missingRes = await _repo.findById(created.id);
    expect(missingRes.isOk()).toBe(true);
    expect(missingRes._unsafeUnwrap()).toBeNull();
  });
});
