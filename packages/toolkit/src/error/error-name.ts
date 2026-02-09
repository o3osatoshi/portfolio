import type { Kind, Layer } from "./error-schema";

/**
 * Build an error `name` string such as `DomainValidationError`.
 *
 * @public
 */
export function composeErrorName(layer: Layer, kind: Kind): string {
  return `${layer}${kind}Error`;
}
