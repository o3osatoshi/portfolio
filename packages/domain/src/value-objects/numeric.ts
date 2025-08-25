import { err, ok, type Result } from "neverthrow";
import { domainValidationError } from "../domain-error";
import type { Brand } from "./brand";
import { makeDecimal, type DecimalString } from "./decimal";

export type Amount = Brand<DecimalString, "Amount">; // strictly > 0
export type Price = Brand<DecimalString, "Price">; // strictly > 0
export type Fee = Brand<DecimalString, "Fee">; // >= 0
export type ProfitLoss = Brand<DecimalString, "ProfitLoss">; // can be negative/positive/zero

function gtZero(d: DecimalString): boolean {
  if (d.startsWith("-")) return false;
  return d !== "0"; // normalized ensures no trailing zeros-only variants
}
function gteZero(d: DecimalString): boolean {
  return !d.startsWith("-");
}

export function makeAmount(v: unknown): Result<Amount, Error> {
  const r = makeDecimal(v);
  if (r.isErr()) return err(r.error);
  if (!gtZero(r.value))
    return err(
      domainValidationError({
        action: "MakeAmount",
        reason: "Amount must be > 0",
      }),
    );
  return ok(r.value as Amount);
}

export function makePrice(v: unknown): Result<Price, Error> {
  const r = makeDecimal(v);
  if (r.isErr()) return err(r.error);
  if (!gtZero(r.value))
    return err(
      domainValidationError({
        action: "MakePrice",
        reason: "Price must be > 0",
      }),
    );
  return ok(r.value as Price);
}

export function makeFee(v: unknown): Result<Fee, Error> {
  const r = makeDecimal(v);
  if (r.isErr()) return err(r.error);
  if (!gteZero(r.value))
    return err(
      domainValidationError({
        action: "MakeFee",
        reason: "Fee must be >= 0",
      }),
    );
  return ok(r.value as Fee);
}

export function makeProfitLoss(v: unknown): Result<ProfitLoss, Error> {
  const r = makeDecimal(v);
  if (r.isErr()) return err(r.error);
  return ok(r.value as ProfitLoss);
}

export function isAmount(v: unknown): v is Amount {
  return typeof v === "string";
}
export function isPrice(v: unknown): v is Price {
  return typeof v === "string";
}
export function isFee(v: unknown): v is Fee {
  return typeof v === "string";
}
export function isProfitLoss(v: unknown): v is ProfitLoss {
  return typeof v === "string";
}
