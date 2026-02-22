import type { UserId } from "@repo/domain";
import { describe, expect, it, vi } from "vitest";

import { Prisma } from "../../generated/prisma/client";
import type { PrismaClient } from "../prisma-client";
import { PrismaUserIdentityStore } from "./prisma-user-identity.store";

function asUserId(value: string): UserId {
  return value as UserId;
}

function createStore(overrides?: {
  findUnique?: (args: unknown) => Promise<{ userId: UserId } | null>;
  upsert?: (args: unknown) => Promise<{ userId: UserId }>;
}) {
  const db = {
    userIdentity: {
      findUnique:
        overrides?.findUnique ??
        (async () => {
          return null;
        }),
      upsert:
        overrides?.upsert ??
        (async () => {
          return { userId: asUserId("u-new") };
        }),
    },
  } as unknown as PrismaClient;

  return new PrismaUserIdentityStore(db);
}

describe("PrismaUserIdentityStore", () => {
  it("findUserIdByIssuerSubject returns null when identity does not exist", async () => {
    const store = createStore();
    const res = await store.findUserIdByIssuerSubject({
      issuer: "https://example.auth0.com",
      subject: "auth0|abc",
    });
    expect(res.isOk()).toBe(true);
    if (res.isOk()) expect(res.value).toBeNull();
  });

  it("resolveUserId returns existing user id", async () => {
    const store = createStore({
      findUnique: async () => ({ userId: asUserId("u-1") }),
    });
    const res = await store.resolveUserId({
      email: "ada@example.com",
      emailVerified: true,
      issuer: "https://example.auth0.com",
      subject: "auth0|abc",
    });
    expect(res.isOk()).toBe(true);
    if (res.isOk()) expect(res.value).toBe("u-1");
  });

  it("resolveUserId rejects when email is missing or unverified", async () => {
    const store = createStore();
    const res = await store.resolveUserId({
      emailVerified: false,
      issuer: "https://example.auth0.com",
      subject: "auth0|abc",
    });
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe("PRISMA_USER_IDENTITY_EMAIL_UNVERIFIED");
    }
  });

  it("resolveUserId links identity with upsert when mapping is absent", async () => {
    const upsert = vi.fn(async () => ({ userId: asUserId("u-2") }));
    const store = createStore({ upsert });
    const res = await store.resolveUserId({
      name: "Ada",
      email: "ada@example.com",
      emailVerified: true,
      issuer: "https://example.auth0.com",
      subject: "auth0|abc",
    });

    expect(res.isOk()).toBe(true);
    if (res.isOk()) expect(res.value).toBe("u-2");
    expect(upsert).toHaveBeenCalledTimes(1);
  });

  it("resolveUserId retries lookup when upsert hits unique constraint", async () => {
    const findUnique = vi
      .fn<(args: unknown) => Promise<{ userId: UserId } | null>>()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ userId: asUserId("u-race") });

    const uniqueConflict = Object.create(
      Prisma.PrismaClientKnownRequestError.prototype,
    ) as Record<string, unknown>;
    uniqueConflict["code"] = "P2002";
    uniqueConflict["message"] = "Unique constraint failed";
    uniqueConflict["meta"] = { target: ["issuer", "subject"] };

    const upsert = vi.fn(async () => {
      throw uniqueConflict;
    });

    const store = createStore({ findUnique, upsert });
    const res = await store.resolveUserId({
      email: "ada@example.com",
      emailVerified: true,
      issuer: "https://example.auth0.com",
      subject: "auth0|abc",
    });

    expect(res.isOk()).toBe(true);
    if (res.isOk()) expect(res.value).toBe("u-race");
    expect(findUnique).toHaveBeenCalledTimes(2);
    expect(upsert).toHaveBeenCalledTimes(1);
  });
});
