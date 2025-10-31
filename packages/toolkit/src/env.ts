import { z } from "zod";

/**
 * Utility type that maps an {@link EnvSchema} to the inferred runtime types
 * produced by each Zod validator.
 *
 * @typeParam T - A map of environment variable names to Zod schemas.
 * @public
 */
export type EnvOf<T extends EnvSchema> = {
  [K in keyof T]: z.infer<T[K]>;
};

/**
 * A map of environment variable names to their Zod validators.
 * Keys correspond to the exact variable names in `process.env`.
 * Unknown variables are ignored; only declared keys are validated and returned.
 *
 * @public
 */
export type EnvSchema = Record<string, z.ZodTypeAny>;

/**
 * Options for {@link createEnv}.
 *
 * @internal
 */
type CreateEnvOptions = {
  /**
   * Optional label used in error messages for clarity, e.g. "web" →
   * `Invalid web env: ...`. If omitted, messages use just `env`.
   */
  name?: string;
  /**
   * Optional source object to read from. Defaults to `process.env`.
   * Useful for testing or SSR environments where a custom map is preferred.
   */
  source?: Record<string, string | undefined>;
};

/**
 * Validates environment variables with Zod and returns a fully typed object.
 *
 * - Reads from `opts.source` when provided, otherwise `process.env`.
 * - Only keys declared in `schema` are returned; others are ignored.
 * - Throws a descriptive `Error` when validation fails, including all issues.
 *
 * @typeParam T - The {@link EnvSchema} describing expected variables.
 * @param schema - Map of variable names to Zod validators.
 * @param opts - Optional settings to customize source and error labeling.
 * @returns A typed object whose values are inferred from the given schemas.
 * @throws Error - When validation fails; message lists each invalid field.
 *
 * @example
 * // Basic usage with defaults
 * const env = createEnv({
 *   NODE_ENV: z.enum(["development", "test", "production"]),
 *   PORT: z.coerce.number().int().positive().default(3000),
 * });
 *
 * @example
 * // Add a label for clearer errors and pass a custom source (e.g. tests)
 * const env = createEnv(
 *   {
 *     API_URL: z.url(),
 *     FEATURE_X: z
 *       .string()
 *       .optional()
 *       .transform((v) => v === "1")
 *       .pipe(z.boolean()),
 *   },
 *   { name: "web", source: { API_URL: "https://example.com", FEATURE_X: "1" } },
 * );
 *
 * @public
 */
export function createEnv<T extends EnvSchema>(
  schema: T,
  opts: CreateEnvOptions = {},
): EnvOf<T> {
  const src = opts.source ?? process.env;
  const result = z.object(schema).safeParse(src);
  if (!result.success) {
    const where = opts.name ? `${opts.name} env` : "env";
    const issues = result.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join(", ");
    throw new Error(`Invalid ${where}: ${issues}`);
  }
  return result.data as EnvOf<T>;
}
