import { toRichError } from "@o3osatoshi/toolkit";

import type { Attributes } from "../types";

export function appendErrorAttributes(
  attributes: Attributes,
  error?: unknown,
): void {
  if (!error) return;

  const rich = toRichError(error);
  if (rich.code) attributes["error.code"] = rich.code;
  attributes["error.kind"] = rich.kind;
  attributes["error.layer"] = rich.layer;

  const reason = rich.details?.reason;
  if (typeof reason === "string" && reason.length > 0) {
    attributes["error.reason"] = reason;
  }
}
