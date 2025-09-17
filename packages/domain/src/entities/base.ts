import { Result } from "neverthrow";

import { type DateTime, newDateTime } from "../value-objects";

export interface Base {
  createdAt: DateTime;
  updatedAt: DateTime;
}

export type NewBaseInput = {
  createdAt: unknown;
  updatedAt: unknown;
};

export function newBase(base: NewBaseInput): Result<Base, Error> {
  return Result.combine([
    newDateTime(base.createdAt),
    newDateTime(base.updatedAt),
  ]).map(([createdAt, updatedAt]) => ({
    createdAt,
    updatedAt,
  }));
}
