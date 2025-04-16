type JsonObject = Record<string, unknown>;

export type AllowedData<T extends JsonObject = JsonObject> =
  | null
  | undefined
  | T;

export type ActionResult<
  T extends AllowedData = JsonObject,
  E extends Error = Error,
> = { ok: true; data: T } | { ok: false; error: E };

export function ok<T extends AllowedData>(data: T): ActionResult<T, never> {
  return { ok: true, data };
}

export function err<E extends Error>(
  error: string | E,
): ActionResult<never, Error | E> {
  return {
    ok: false,
    error: typeof error === "string" ? new Error(error) : error,
  };
}
