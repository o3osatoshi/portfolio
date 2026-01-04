import { Result } from "neverthrow";
import type { z } from "zod";

import type { Layer } from "../error";
import { newZodError } from "./zod-error";

/**
 * Creates a synchronous Result-returning parser from a Zod schema.
 *
 * - Uses `schema.parse`, allowing Zod to throw on validation errors.
 * - Normalises thrown errors through {@link newZodError} with the supplied context.
 *
 * @typeParam T - Zod schema type inferred from the provided `schema`.
 * @param schema - Zod schema used to validate or transform incoming data.
 * @param ctx - Context describing the logical action and optional layer override.
 * @returns A function that yields a neverthrow Result containing the inferred schema output.
 * @example
 * ```ts
 * const parseUser = parseWith(userSchema, { action: "ParseUser", layer: "UI" });
 * const res = parseUser(someInput);
 * // Result of parsed type
 * ```
 * @public
 */
export function parseWith<T extends z.ZodType>(
  schema: T,
  ctx: { action: string; layer?: Layer },
): (input: unknown) => Result<z.infer<T>, Error> {
  const { action, layer } = ctx;
  return Result.fromThrowable(
    (input: unknown) => schema.parse(input) as z.infer<T>,
    (cause) => newZodError({ action, cause, layer }),
  );
}
