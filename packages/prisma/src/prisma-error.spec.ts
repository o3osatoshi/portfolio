import { describe, expect, it } from "vitest";
import { Prisma } from "./prisma-client";
import { newPrismaError } from "./prisma-error";

function fabricateKnownRequestError(
  code: string,
  meta?: Record<string, unknown>,
  message?: string,
): unknown {
  const err = Object.create(
    Prisma.PrismaClientKnownRequestError.prototype,
  ) as Record<string, unknown>;
  err["code"] = code;
  if (meta) err["meta"] = meta;
  err["message"] = message ?? code;
  return err as unknown;
}

function fabricateUnknownRequestError(message: string): unknown {
  const err = Object.create(
    Prisma.PrismaClientUnknownRequestError.prototype,
  ) as Record<string, unknown>;
  err["message"] = message;
  return err as unknown;
}

function fabricateInitializationError(message: string): unknown {
  const err = Object.create(
    Prisma.PrismaClientInitializationError.prototype,
  ) as Record<string, unknown>;
  err["message"] = message;
  return err as unknown;
}

function fabricateValidationError(message: string): unknown {
  const err = Object.create(
    Prisma.PrismaClientValidationError.prototype,
  ) as Record<string, unknown>;
  err["message"] = message;
  return err as unknown;
}

describe("prisma newPrismaError override", () => {
  it("maps P2002 to DBIntegrityError with target", () => {
    const cause = fabricateKnownRequestError("P2002", { target: ["email"] });
    const err = newPrismaError({ action: "CreateUser", cause });
    expect(err.name).toBe("DBIntegrityError");
    expect(err.message).toContain("CreateUser failed");
    expect(err.message).toContain("Unique constraint violation");
    expect(err.message).toContain("email");
  });

  it("maps P2025 to DBNotFoundError and uses meta.cause if present", () => {
    const cause = fabricateKnownRequestError("P2025", {
      cause: "No record found for where condition",
    });
    const err = newPrismaError({ action: "UpdateTransaction", cause });
    expect(err.name).toBe("DBNotFoundError");
    expect(err.message).toContain("UpdateTransaction failed");
    expect(err.message).toContain(
      "because No record found for where condition",
    );
  });

  it("maps validation class to DBValidationError", () => {
    const cause = fabricateValidationError("Invalid query");
    const err = newPrismaError({ action: "Query", cause });
    expect(err.name).toBe("DBValidationError");
    expect(err.message).toContain("Invalid Prisma query or data");
  });

  it("maps initialization P1001 to DBUnavailableError and adds hint", () => {
    const cause = fabricateInitializationError(
      "P1001: could not connect to server",
    );
    const err = newPrismaError({ action: "Connect", cause });
    expect(err.name).toBe("DBUnavailableError");
    expect(err.message).toContain("Connect failed");
    expect(err.message).toContain("Hint:");
  });

  it("maps unknown request error with deadlock to DBDeadlockError", () => {
    const cause = fabricateUnknownRequestError("deadlock detected");
    const err = newPrismaError({ action: "TxCommit", cause });
    expect(err.name).toBe("DBDeadlockError");
    expect(err.message).toContain("TxCommit failed");
  });
});
