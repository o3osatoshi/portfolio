import { Result } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { type DateTime, newDateTime } from "../value-objects";

/**
 * Minimal properties shared by all persisted domain entities.
 */
export interface Base {
  createdAt: DateTime;
  updatedAt: DateTime;
}

/**
 * Untyped input accepted by {@link newBase} before validation.
 */
export type NewBaseInput = {
  createdAt: unknown;
  updatedAt: unknown;
};

/**
 * Validate core temporal metadata for new domain entities.
 */
export function newBase(base: NewBaseInput): Result<Base, RichError> {
  return Result.combine([
    newDateTime(base.createdAt),
    newDateTime(base.updatedAt),
  ]).map(([createdAt, updatedAt]) => ({
    createdAt,
    updatedAt,
  }));
}
