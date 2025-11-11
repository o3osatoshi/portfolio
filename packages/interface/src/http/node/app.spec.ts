import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

import { buildApp, buildHandler } from "./app";

const noopRepo = {
  create: async () => {
    throw new Error("not implemented");
  },
  delete: async () => undefined,
  findById: async () => null,
  findByUserId: async () => [],
  update: async () => undefined,
};

describe("http/node/app", () => {
  it("serves health check", async () => {
    // @ts-expect-error
    const app = buildApp({ transactionRepo: noopRepo });
    const res = await app.request("/api/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("GET handler responds to healthz", async () => {
    // @ts-expect-error
    const { GET } = buildHandler({ transactionRepo: noopRepo });
    const res = await GET(new Request("http://test.local/api/healthz"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("lists transactions for a valid user", async () => {
    const now = new Date();
    const tx = {
      id: "tx-1",
      amount: "1.23",
      createdAt: now,
      currency: "USD",
      datetime: now,
      fee: "0.01",
      feeCurrency: "USD",
      price: "100.00",
      profitLoss: "0",
      type: "BUY",
      updatedAt: now,
      userId: "u-1",
    } as const;

    const app = buildApp({
      transactionRepo: {
        // @ts-expect-error
        findByUserId: () => okAsync([tx]),
      },
    });

    const res = await app.request("/api/labs/transactions?userId=u-1");
    expect(res.status).toBe(200);
    const list = (await res.json()) as unknown[];
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(1);
    expect(list[0]).toMatchObject({ id: "tx-1", type: "BUY", userId: "u-1" });
  });

  it("returns 400 when userId is missing or blank", async () => {
    // @ts-expect-error
    const app = buildApp({ transactionRepo: noopRepo });

    const res1 = await app.request("/api/labs/transactions");
    expect(res1.status).toBe(400);

    const res2 = await app.request("/api/labs/transactions?userId=%20%20%20");
    expect(res2.status).toBe(400);
  });

  it("accepts minimal non-empty userId (length = 1)", async () => {
    const app = buildApp({
      // @ts-expect-error
      transactionRepo: {
        ...noopRepo,
        findByUserId: () => okAsync([]),
      },
    });
    const res = await app.request("/api/labs/transactions?userId=a");
    expect(res.status).toBe(200);
    const list = (await res.json()) as unknown[];
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(0);
  });

  it("allows surrounding whitespace in userId (validated via trim)", async () => {
    const now = new Date();
    const tx = {
      id: "tx-2",
      amount: "2.00",
      createdAt: now,
      currency: "USD",
      datetime: now,
      fee: "0",
      feeCurrency: "USD",
      price: "1.00",
      profitLoss: "0",
      type: "SELL",
      updatedAt: now,
      userId: "  u-2  ",
    } as const;

    const app = buildApp({
      transactionRepo: {
        ...noopRepo,
        // @ts-expect-error
        findByUserId: () => okAsync([tx]),
      },
    });

    const res = await app.request(
      "/api/labs/transactions?userId=%20%20u-2%20%20",
    );
    expect(res.status).toBe(200);
    const list = (await res.json()) as unknown[];
    expect(list.length).toBe(1);
    expect(list[0]).toMatchObject({ id: "tx-2", type: "SELL" });
  });

  it("propagates repository NotFound as 404", async () => {
    const app = buildApp({
      // @ts-expect-error
      transactionRepo: {
        ...noopRepo,
        findByUserId: () =>
          // Simulate a repository lookup failure for a user
          errAsync(
            new (class extends Error {
              constructor() {
                super("Missing");
                this.name = "DomainNotFoundError";
              }
            })(),
          ),
      },
    });

    const res = await app.request("/api/labs/transactions?userId=none");
    expect(res.status).toBe(404);
  });

  it("propagates repository Forbidden as 403", async () => {
    const app = buildApp({
      // @ts-expect-error
      transactionRepo: {
        ...noopRepo,
        findByUserId: () =>
          errAsync(
            new (class extends Error {
              constructor() {
                super("Forbidden");
                this.name = "DomainForbiddenError";
              }
            })(),
          ),
      },
    });

    const res = await app.request("/api/labs/transactions?userId=u-x");
    expect(res.status).toBe(403);
  });
});
