import { err, ok, type Result } from "neverthrow";

import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";
import { type DecimalString, newDecimal } from "./decimal";

export type Amount = Brand<DecimalString, "Amount">; // strictly > 0
export type Fee = Brand<DecimalString, "Fee">; // >= 0
export type Price = Brand<DecimalString, "Price">; // strictly > 0
export type ProfitLoss = Brand<DecimalString, "ProfitLoss">; // can be negative/positive/zero

export function isAmount(v: unknown): v is Amount {
  return typeof v === "string";
}
export function isFee(v: unknown): v is Fee {
  return typeof v === "string";
}

export function isPrice(v: unknown): v is Price {
  return typeof v === "string";
}

export function isProfitLoss(v: unknown): v is ProfitLoss {
  return typeof v === "string";
}

export function newAmount(v: unknown): Result<Amount, Error> {
  const r = newDecimal(v);
  if (r.isErr()) return err(r.error);
  if (!gtZero(r.value))
    return err(
      domainValidationError({
        action: "NewAmount",
        reason: "Amount must be > 0",
      }),
    );
  return ok(r.value as Amount);
}

export function newFee(v: unknown): Result<Fee, Error> {
  const r = newDecimal(v);
  if (r.isErr()) return err(r.error);
  if (!gteZero(r.value))
    return err(
      domainValidationError({
        action: "NewFee",
        reason: "Fee must be >= 0",
      }),
    );
  return ok(r.value as Fee);
}

export function newPrice(v: unknown): Result<Price, Error> {
  const r = newDecimal(v);
  if (r.isErr()) return err(r.error);
  if (!gtZero(r.value))
    return err(
      domainValidationError({
        action: "NewPrice",
        reason: "Price must be > 0",
      }),
    );
  return ok(r.value as Price);
}
export function newProfitLoss(v: unknown): Result<ProfitLoss, Error> {
  const r = newDecimal(v);
  if (r.isErr()) return err(r.error);
  return ok(r.value as ProfitLoss);
}
function gteZero(d: DecimalString): boolean {
  return !d.startsWith("-");
}
function gtZero(d: DecimalString): boolean {
  if (d.startsWith("-")) return false;
  return d !== "0"; // normalized ensures no trailing zeros-only variants
}
