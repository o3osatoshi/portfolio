import { toRichError } from "@o3osatoshi/toolkit";

import type { Attributes } from "../types";

/**
 * Append normalized error details to logging attributes.
 *
 * @public
 * @param attributes - Mutable attribute map where error metadata is added.
 * @param error - Error-like value to normalize before logging.
 * @returns void
 */
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
