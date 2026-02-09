import { describe, expect, it } from "vitest";

import { isRichError } from "@o3osatoshi/toolkit";

import { Prisma } from "../generated/prisma/client";
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
  it("maps P2000 to PersistenceValidationError and surfaces column name", () => {
    const cause = fabricateKnownRequestError("P2000", {
      column_name: "description",
    });
    const err = newPrismaError({
      cause,
      details: { action: "SavePost" },
    });
    expect(err.name).toBe("PersistenceValidationError");
    const message = err.message;
    expect(message).toContain(
      "SavePost failed: Value too long for description",
    );
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.hint).toBe("Shorten value or alter schema.");
      expect(err.meta?.["prismaSource"]).toBe("prisma.newPrismaError");
      expect(err.meta?.["prismaErrorClass"]).toBe(
        "PrismaClientKnownRequestError",
      );
      expect(err.meta?.["prismaCode"]).toBe("P2000");
      expect(err.meta?.["prismaColumn"]).toBe("description");
    }
  });

  it("maps P2002 to PersistenceConflictError with target", () => {
    const cause = fabricateKnownRequestError("P2002", { target: ["email"] });
    const err = newPrismaError({
      cause,
      details: { action: "CreateUser" },
    });
    expect(err.name).toBe("PersistenceConflictError");
    const message = err.message;
    expect(message).toContain(
      "CreateUser failed: Unique constraint violation on email",
    );
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.hint).toBe(
        "Use a different value for unique fields.",
      );
      expect(err.meta?.["prismaTarget"]).toBe("email");
    }
  });

  it("maps P2025 to PersistenceNotFoundError and uses meta.cause if present", () => {
    const cause = fabricateKnownRequestError("P2025", {
      cause: "No record found for where condition",
    });
    const err = newPrismaError({
      cause,
      details: { action: "UpdateTransaction" },
    });
    expect(err.name).toBe("PersistenceNotFoundError");
    const message = err.message;
    expect(message).toContain(
      "UpdateTransaction failed: No record found for where condition",
    );
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.hint).toBe("Verify where conditions or record id.");
      expect(err.meta?.["prismaNotFoundCause"]).toBe(
        "No record found for where condition",
      );
    }
  });

  it("falls back to a default reason when meta.cause is not a string", () => {
    const cause = fabricateKnownRequestError("P2025", { cause: 42 });
    const err = newPrismaError({
      cause,
      details: { action: "RemoveRecord" },
    });
    expect(err.name).toBe("PersistenceNotFoundError");
    expect(err.message).toContain("Record not found");
  });

  it("maps foreign key and invalid value errors appropriately", () => {
    const fk = fabricateKnownRequestError("P2003");
    const fkErr = newPrismaError({
      cause: fk,
      details: { action: "LinkChild" },
    });
    expect(fkErr.name).toBe("PersistenceConflictError");
    expect(fkErr.message).toContain(
      "LinkChild failed: Foreign key constraint failed",
    );

    const invalid = fabricateKnownRequestError("P2006");
    const invalidErr = newPrismaError({
      cause: invalid,
      details: { action: "InsertData" },
    });
    expect(invalidErr.name).toBe("PersistenceValidationError");
    expect(invalidErr.message).toContain("InsertData failed: Invalid value");
  });

  it("maps schema configuration codes to PersistenceInternalError", () => {
    const cause = fabricateKnownRequestError("P2021");
    const err = newPrismaError({
      cause,
      details: { action: "QueryTable" },
    });
    expect(err.name).toBe("PersistenceInternalError");
    expect(err.message).toContain("QueryTable failed: Table does not exist");
  });

  it("maps validation class to PersistenceValidationError", () => {
    const cause = fabricateValidationError("Invalid query");
    const err = newPrismaError({
      cause,
      details: { action: "Query" },
    });
    expect(err.name).toBe("PersistenceValidationError");
    expect(err.message).toContain("Query failed: Invalid Prisma query or data");
  });

  it("classifies initialization errors by message", () => {
    const unavailable = fabricateInitializationError(
      "P1001: could not connect to server",
    );
    const unavailableErr = newPrismaError({
      cause: unavailable,
      details: { action: "Connect" },
    });
    expect(unavailableErr.name).toBe("PersistenceUnavailableError");
    expect(isRichError(unavailableErr)).toBe(true);
    if (isRichError(unavailableErr)) {
      expect(unavailableErr.details?.hint).toBe(
        "Ensure database is reachable and running.",
      );
    }

    const timeout = fabricateInitializationError(
      "P1002: timed out while connecting",
    );
    const timeoutErr = newPrismaError({
      cause: timeout,
      details: { action: "Init" },
    });
    expect(timeoutErr.name).toBe("PersistenceTimeoutError");
    expect(isRichError(timeoutErr)).toBe(true);
    if (isRichError(timeoutErr)) {
      expect(timeoutErr.details?.hint).toBe(
        "Check database connectivity and network.",
      );
    }

    const unauthorized = fabricateInitializationError(
      "P1000: Authentication failed against database server",
    );
    const unauthorizedErr = newPrismaError({
      cause: unauthorized,
      details: { action: "Init" },
    });
    expect(unauthorizedErr.name).toBe("PersistenceUnauthorizedError");
    expect(unauthorizedErr.message).not.toContain(
      "Check database connectivity",
    );
  });

  it("maps unknown request errors to specific kinds", () => {
    const deadlock = fabricateUnknownRequestError("deadlock detected");
    const deadlockErr = newPrismaError({
      cause: deadlock,
      details: { action: "TxCommit" },
    });
    expect(deadlockErr.name).toBe("PersistenceConflictError");

    const serialization = fabricateUnknownRequestError(
      "Could not serialize access due to read/write dependencies",
    );
    const serializationErr = newPrismaError({
      cause: serialization,
      details: { action: "Commit" },
    });
    expect(serializationErr.name).toBe("PersistenceSerializationError");
  });

  it("maps rust panics to PersistenceInternalError with a helpful hint", () => {
    const cause = fabricateRustPanicError();
    const err = newPrismaError({
      cause,
      details: { action: "Execute" },
    });
    expect(err.name).toBe("PersistenceInternalError");
    const message = err.message;
    expect(message).toContain("Execute failed: Prisma engine panic");
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.hint).toBe("Inspect logs; restart the process.");
    }
  });

  it("falls back to PersistenceInternalError for non-Prisma causes", () => {
    const err = newPrismaError({
      cause: new Error("boom"),
      details: { action: "HandleMisc", hint: "Check logs" },
    });
    expect(err.name).toBe("PersistenceInternalError");
    expect(err.message).toContain("HandleMisc failed: Unexpected error");
    expect(isRichError(err)).toBe(true);
    if (isRichError(err)) {
      expect(err.details?.hint).toBe("Check logs");
    }
  });
});
