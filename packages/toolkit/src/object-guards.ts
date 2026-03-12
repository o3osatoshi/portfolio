/**
 * Returns true when the value is object-like (`typeof value === "object"` and non-null).
 *
 * @public
 */
export function isObjectLike(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

/**
 * Returns true when the value is a plain object (`Object.prototype` or `null` prototype).
 *
 * @public
 */
export function isPlainObject(
  value: unknown,
): value is Record<string, unknown> {
  if (!isRecord(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Returns true when the value is a non-null object record and not an array.
 *
 * @public
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return isObjectLike(value) && !Array.isArray(value);
}
