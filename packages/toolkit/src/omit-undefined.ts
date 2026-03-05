import { isPlainObject } from "./object-guards";

/**
 * Recursively removes `undefined` from object value types.
 *
 * @remarks
 * - Keys whose value type can be `undefined` become optional.
 * - Arrays and non-plain object-like values are preserved as-is.
 *
 * @public
 */
export type OmitUndefinedDeep<T> = T extends
  | ((...args: never[]) => unknown)
  | bigint
  | boolean
  | Date
  | Error
  | Map<unknown, unknown>
  | null
  | number
  | Promise<unknown>
  | ReadonlyMap<unknown, unknown>
  | ReadonlySet<unknown>
  | RegExp
  | Set<unknown>
  | string
  | symbol
  | WeakMap<object, unknown>
  | WeakSet<object>
  ? Exclude<T, undefined>
  : T extends readonly unknown[]
    ? T
    : T extends Record<string, unknown>
      ? {
          [K in keyof T as undefined extends T[K]
            ? K
            : never]?: OmitUndefinedDeep<Exclude<T[K], undefined>>;
        } & {
          [K in keyof T as undefined extends T[K]
            ? never
            : K]: OmitUndefinedDeep<T[K]>;
        }
      : Exclude<T, undefined>;

/**
 * Returns a copy of `input` with keys whose value is `undefined` removed.
 *
 * @remarks
 * - Recursively processes only plain objects (`Object.prototype` or `null` prototype).
 * - Arrays and non-plain objects (Date, Map, Set, functions, class instances) are preserved as-is.
 * - `null`, `0`, `false`, and empty strings are preserved.
 *
 * @public
 */
export function omitUndefined<T extends object>(
  input: T,
): OmitUndefinedDeep<T> {
  const result = Object.create(Object.getPrototypeOf(input)) as Record<
    string,
    unknown
  >;

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) {
      continue;
    }

    result[key] = isPlainObject(value) ? omitUndefined(value) : value;
  }

  return result as OmitUndefinedDeep<T>;
}
