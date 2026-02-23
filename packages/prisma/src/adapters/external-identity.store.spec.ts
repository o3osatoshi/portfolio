import type { UserId } from "@repo/domain";
import { describe, expect, it, vi } from "vitest";

import { Prisma } from "../../generated/prisma/client";
import type { PrismaClient } from "../prisma-client";
import { externalIdentityErrorCodes } from "./external-identity-error-catalog";
import { PrismaExternalIdentityStore } from "./external-identity.store";

function asUserId(value: string): UserId {
  return value as UserId;
}

function createStore(overrides?: {
  findUnique?: (args: unknown) => Promise<{ userId: UserId } | null>;
  upsert?: (args: unknown) => Promise<{ userId: UserId }>;
}) {
  const db = {
    externalIdentity: {
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

  return new PrismaExternalIdentityStore(db);
}

describe("PrismaExternalIdentityStore", () => {
  it("findUserIdByKey returns null when identity does not exist", async () => {
    const store = createStore();
    const res = await store.findUserIdByKey({
      issuer: "https://example.auth0.com",
      subject: "auth0|abc",
    });
    expect(res.isOk()).toBe(true);
    if (res.isOk()) expect(res.value).toBeNull();
  });

  it("linkExternalIdentityToUserByEmail returns mapped user id via upsert", async () => {
    const store = createStore({
      upsert: async () => ({ userId: asUserId("u-1") }),
    });
    const res = await store.linkExternalIdentityToUserByEmail({
      email: "ada@example.com",
      emailVerified: true,
      issuer: "https://example.auth0.com",
      subject: "auth0|abc",
    });
    expect(res.isOk()).toBe(true);
    if (res.isOk()) expect(res.value).toBe("u-1");
  });

  it("linkExternalIdentityToUserByEmail rejects when email is missing or unverified", async () => {
    const store = createStore();
    const res = await store.linkExternalIdentityToUserByEmail({
      emailVerified: false,
      issuer: "https://example.auth0.com",
      subject: "auth0|abc",
    });
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.code).toBe(externalIdentityErrorCodes.EMAIL_UNVERIFIED);
    }
  });

  it("linkExternalIdentityToUserByEmail links identity with upsert when mapping is absent", async () => {
    const upsert = vi.fn(async () => ({ userId: asUserId("u-2") }));
    const store = createStore({ upsert });
    const res = await store.linkExternalIdentityToUserByEmail({
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

  it("linkExternalIdentityToUserByEmail retries lookup when upsert hits unique constraint", async () => {
    const findUnique = vi
      .fn<(args: unknown) => Promise<{ userId: UserId } | null>>()
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
    const res = await store.linkExternalIdentityToUserByEmail({
      email: "ada@example.com",
      emailVerified: true,
      issuer: "https://example.auth0.com",
      subject: "auth0|abc",
    });

    expect(res.isOk()).toBe(true);
    if (res.isOk()) expect(res.value).toBe("u-race");
    expect(findUnique).toHaveBeenCalledTimes(1);
    expect(upsert).toHaveBeenCalledTimes(1);
  });
});
