import type { DateTime } from "../value-objects";

export interface Base {
  createdAt: DateTime;
  updatedAt: DateTime;
}
