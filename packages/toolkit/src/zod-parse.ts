import { Result, ResultAsync } from "neverthrow";
import type { ZodTypeAny, z } from "zod";
import { type Layer, newZodError } from "./zod-error";

/**
 * Create a Result-returning parser from a Zod schema.
 *
 * - Uses `schema.parse` (sync). If validation fails, Zod throws.
 * - Thrown errors are normalized via `newZodError` using the provided `action`/`layer`.
 *
 * @template T extends ZodTypeAny
 * @param schema - Zod schema to validate/transform the input.
 * @param ctx - Context for standardized error shaping.
 * @param ctx.action - Logical operation name (e.g. "ParseCreateTransactionRequest").
 * @param ctx.layer - Error layer; defaults to Application inside `newZodError`.
 * @returns Function that parses input into `Result<z.infer<T>, Error>`.
 * @example
 * const parseUser = parseWith(userSchema, { action: "ParseUser", layer: "UI" });
 * const res = parseUser({ name: "alice" }); // Result<User, Error>
 */
export function parseWith<T extends ZodTypeAny>(
  schema: T,
  ctx: { action: string; layer?: Layer },
): (input: unknown) => Result<z.infer<T>, Error> {
  const { action, layer } = ctx;
  return Result.fromThrowable(
    (input: unknown) => schema.parse(input) as z.infer<T>,
    (cause) => newZodError({ action, cause, layer }),
  );
}

/**
 * Create an async Result-returning parser from a Zod schema.
 *
 * - Uses `schema.parseAsync` for async refinements/validations.
 * - Rejections are normalized via `newZodError` using the provided `action`/`layer`.
 *
 * @template T extends ZodTypeAny
 * @param schema - Zod schema to validate/transform input asynchronously.
 * @param ctx - Context for standardized error shaping.
 * @param ctx.action - Logical operation name (e.g. "ParseToken").
 * @param ctx.layer - Error layer; defaults to Application inside `newZodError`.
 * @returns Function that parses input into `ResultAsync<z.infer<T>, Error>`.
 * @example
 * const parseToken = parseAsyncWith(tokenSchema, { action: "ParseToken", layer: "Auth" });
 * const res = await parseToken({ token: "ok" }); // ResultAsync<Token, Error>
 */
export function parseAsyncWith<T extends ZodTypeAny>(
  schema: T,
  ctx: { action: string; layer?: Layer },
): (input: unknown) => ResultAsync<z.infer<T>, Error> {
  const { action, layer } = ctx;
  return (input: unknown): ResultAsync<z.infer<T>, Error> =>
    ResultAsync.fromPromise(
      schema.parseAsync(input) as Promise<z.infer<T>>,
      (cause) => newZodError({ action, cause, layer }),
    );
}
