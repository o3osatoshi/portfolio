import { type Kind, kindSchema, type Layer, layerSchema } from "./error-schema";

/**
 * Utilities for composing and parsing structured error names used
 * throughout `@o3osatoshi/toolkit`.
 *
 * @public
 */

const LAYER_VALUES = layerSchema.options as readonly Layer[];

const KIND_VALUES = kindSchema.options as readonly Kind[];

/**
 * Parsed components recovered from a structured error name.
 *
 * @public
 */
export type ErrorNameParts = {
  kind?: Kind;
  layer?: Layer;
};

/**
 * Build an error `name` string such as `DomainValidationError`.
 *
 * @public
 */
export function composeErrorName(layer: Layer, kind: Kind): string {
  return `${layer}${kind}Error`;
}

/**
 * Attempt to recover `layer` and `kind` from a structured error `name`.
 *
 * @public
 */
export function parseErrorName(name: string | undefined): ErrorNameParts {
  if (!name || !name.endsWith("Error")) return {};
  const withoutSuffix = name.slice(0, -5);
  const layer = LAYER_VALUES.find((candidate) =>
    withoutSuffix.startsWith(candidate),
  );
  if (!layer) return {};
  const remaining = withoutSuffix.slice(layer.length);
  const kind = KIND_VALUES.find((candidate) => candidate === remaining);
  return kind ? { kind, layer } : { layer };
}
