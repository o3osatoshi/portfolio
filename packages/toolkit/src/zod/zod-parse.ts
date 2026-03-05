import { Result } from "neverthrow";
import type { z } from "zod";

import type { Layer, RichError } from "../error";
import { newZodError } from "./zod-error";

/**
 * Creates a synchronous Result-returning parser from a Zod schema.
 *
 * - Uses `schema.parse`, allowing Zod to throw on validation errors.
 * - Normalises thrown errors through {@link newZodError} with the supplied context.
 *
 * @typeParam T - Zod schema type inferred from the provided `schema`.
 * @param schema - Zod schema used to validate or transform incoming data.
 * @param ctx - Context describing action plus optional code/layer/error mapping controls.
 * @returns A function that yields a neverthrow Result containing the inferred schema output.
 * @example
 * ```ts
 * const parseUser = parseWith(userSchema, { action: "ParseUser", layer: "Presentation" });
 * const res = parseUser(someInput);
 * // Result of parsed type
 * ```
 * @public
 */
export function parseWith<T extends z.ZodType>(
  schema: T,
  ctx: {
    action: string;
    code?: string | undefined;
    includeValidationIssues?: boolean | undefined;
    layer?: Layer;
    mapError?: ((error: RichError) => RichError) | undefined;
  },
): (input: unknown) => Result<z.infer<T>, RichError> {
  const { action, mapError, ...rest } = ctx;
  return Result.fromThrowable(
    (input: unknown) => schema.parse(input),
    (cause) => {
      const error = newZodError({
        ...rest,
        cause,
        details: { action },
      });

      if (!mapError) {
        return error;
      }

      try {
        return mapError(error);
      } catch {
        return error;
      }
    },
  );
}
