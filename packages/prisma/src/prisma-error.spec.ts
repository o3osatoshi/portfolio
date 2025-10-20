import { describe, expect, it } from "vitest";

import { Prisma } from "./prisma-client";
import { newPrismaError } from "./prisma-error";

function fabricateInitializationError(message: string): unknown {
  const err = Object.create(
    Prisma.PrismaClientInitializationError.prototype,
  ) as Record<string, unknown>;
  err["message"] = message;
  return err;
}

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
  return err;
}

function fabricateRustPanicError(): unknown {
  return Object.create(Prisma.PrismaClientRustPanicError.prototype) as Record<
    string,
    unknown
  >;
}

function fabricateUnknownRequestError(message: string): unknown {
  const err = Object.create(
    Prisma.PrismaClientUnknownRequestError.prototype,
  ) as Record<string, unknown>;
  err["message"] = message;
  return err;
}

function fabricateValidationError(message: string): unknown {
  const err = Object.create(
    Prisma.PrismaClientValidationError.prototype,
  ) as Record<string, unknown>;
  err["message"] = message;
  return err;
}

describe("prisma newPrismaError override", () => {
  it("maps P2000 to DBValidationError and surfaces column name", () => {
    const cause = fabricateKnownRequestError("P2000", {
      column_name: "description",
    });
    const err = newPrismaError({ action: "SavePost", cause });
    expect(err.name).toBe("DBValidationError");
    expect(err.message).toContain("SavePost failed");
    expect(err.message).toContain("Value too long for description");
    expect(err.message).toContain("Hint: Shorten value or alter schema.");
  });

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
    expect(err.message).toContain(
      "because No record found for where condition",
    );
  });

  it("falls back to a default reason when meta.cause is not a string", () => {
    const cause = fabricateKnownRequestError("P2025", { cause: 42 });
    const err = newPrismaError({ action: "RemoveRecord", cause });
    expect(err.name).toBe("DBNotFoundError");
    expect(err.message).toContain("because Record not found");
  });

  it("maps foreign key and invalid value errors appropriately", () => {
    const fk = fabricateKnownRequestError("P2003");
    const fkErr = newPrismaError({ action: "LinkChild", cause: fk });
    expect(fkErr.name).toBe("DBIntegrityError");
    expect(fkErr.message).toContain("Foreign key constraint failed");

    const invalid = fabricateKnownRequestError("P2006");
    const invalidErr = newPrismaError({ action: "InsertData", cause: invalid });
    expect(invalidErr.name).toBe("DBValidationError");
    expect(invalidErr.message).toContain("Invalid value");
  });

  it("maps schema configuration codes to DBConfigError", () => {
    const cause = fabricateKnownRequestError("P2021");
    const err = newPrismaError({ action: "QueryTable", cause });
    expect(err.name).toBe("DBConfigError");
    expect(err.message).toContain("Table does not exist");
  });

  it("maps validation class to DBValidationError", () => {
    const cause = fabricateValidationError("Invalid query");
    const err = newPrismaError({ action: "Query", cause });
    expect(err.name).toBe("DBValidationError");
    expect(err.message).toContain("Invalid Prisma query or data");
  });

  it("classifies initialization errors by message", () => {
    const unavailable = fabricateInitializationError(
      "P1001: could not connect to server",
    );
    const unavailableErr = newPrismaError({
      action: "Connect",
      cause: unavailable,
    });
    expect(unavailableErr.name).toBe("DBUnavailableError");
    expect(unavailableErr.message).toContain(
      "Hint: Ensure database is reachable and running.",
    );

    const timeout = fabricateInitializationError(
      "P1002: timed out while connecting",
    );
    const timeoutErr = newPrismaError({ action: "Init", cause: timeout });
    expect(timeoutErr.name).toBe("DBTimeoutError");
    expect(timeoutErr.message).toContain(
      "Hint: Check database connectivity and network.",
    );

    const unauthorized = fabricateInitializationError(
      "P1000: Authentication failed against database server",
    );
    const unauthorizedErr = newPrismaError({
      action: "Init",
      cause: unauthorized,
    });
    expect(unauthorizedErr.name).toBe("DBUnauthorizedError");
    expect(unauthorizedErr.message).not.toContain(
      "Check database connectivity",
    );
  });

  it("maps unknown request errors to specific kinds", () => {
    const deadlock = fabricateUnknownRequestError("deadlock detected");
    const deadlockErr = newPrismaError({ action: "TxCommit", cause: deadlock });
    expect(deadlockErr.name).toBe("DBDeadlockError");

    const serialization = fabricateUnknownRequestError(
      "Could not serialize access due to read/write dependencies",
    );
    const serializationErr = newPrismaError({
      action: "Commit",
      cause: serialization,
    });
    expect(serializationErr.name).toBe("DBSerializationError");
  });

  it("maps rust panics to DBUnknownError with a helpful hint", () => {
    const cause = fabricateRustPanicError();
    const err = newPrismaError({ action: "Execute", cause });
    expect(err.name).toBe("DBUnknownError");
    expect(err.message).toContain("Prisma engine panic");
    expect(err.message).toContain("Hint: Inspect logs; restart the process.");
  });

  it("falls back to DBUnknownError for non-Prisma causes", () => {
    const err = newPrismaError({
      action: "HandleMisc",
      cause: new Error("boom"),
      hint: "Check logs",
    });
    expect(err.name).toBe("DBUnknownError");
    expect(err.message).toContain("Unexpected error");
    expect(err.message).toContain("Hint: Check logs");
  });
});
