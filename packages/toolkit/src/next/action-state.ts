import {
  type RichError,
  type SerializedRichError,
  serializeRichError,
} from "../error";
import type { UnknownRecord } from "../types";

/**
 * Data payload accepted by {@link ActionState}. Designed to mirror the
 * "state" slot used by React `useActionState` for server actions.
 *
 * @typeParam TBase - Base (non-null) data payload type; defaults to {@link UnknownRecord}.
 * @public
 * @remarks
 * - The full payload type is a union of `TBase | null | undefined`.
 * - `null` / `undefined` can be used to represent "no result yet" or an intentionally empty payload.
 */
export type ActionData<TBase extends UnknownRecord = UnknownRecord> =
  | null
  | TBase
  | undefined;

/**
 * Success/failure envelope compatible with React `useActionState`.
 *
 * @typeParam T - Type of the `data` field; should usually be an {@link ActionData} union.
 * @typeParam E - Error payload type; defaults to {@link SerializedRichError}.
 * @public
 * @remarks
 * - The success shape is `{ ok: true, data }`.
 * - The failure shape is `{ ok: false, error }`.
 * - In some generic compositions this type can collapse to `never` to represent an impossible branch; at runtime you only handle the success and failure shapes.
 */
export type ActionState<
  T extends ActionData = UnknownRecord,
  E extends SerializedRichError = SerializedRichError,
> = { data: T; ok: true } | { error: E; ok: false } | never;

/**
 * Build a failure {@link ActionState}.
 *
 * @public
 * @param error - Structured error that should already be handled as {@link RichError}.
 * @returns An {@link ActionState} with `ok: false` and serialized RichError metadata.
 * @remarks
 * - Errors are always serialized via {@link serializeRichError}.
 * - Stack traces are omitted for server action payload safety.
 */
export function err(error: RichError): ActionState<never, SerializedRichError> {
  return {
    error: serializeRichError(error, {
      depth: 0,
      includeStack: false,
    }),
    ok: false,
  };
}

/**
 * Build a success {@link ActionState}.
 *
 * @public
 * @param data - Arbitrary payload you want to return to the caller.
 * @returns An {@link ActionState} with `ok: true` and the supplied data. The returned type uses `E = never` so that the failure branch is impossible when you construct the state via this helper.
 */
export function ok<T extends ActionData>(data: T): ActionState<T, never> {
  return { data, ok: true };
}
