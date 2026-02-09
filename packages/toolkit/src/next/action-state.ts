import {
  isRichError,
  type Kind,
  type Layer,
  type RichErrorI18n,
} from "../error";
import type { UnknownRecord } from "../types";
import { userMessageFromError } from "./error-message";

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
 * Minimal error shape delivered to the client side.
 *
 * Includes optional machine metadata (`code` / `i18n` / `kind` / `layer`)
 * so presentation layers can localize and branch without exposing stack/cause.
 *
 * @public
 */
export type ActionError = {
  code?: string | undefined;
  i18n?: RichErrorI18n | undefined;
  kind?: Kind | undefined;
  layer?: Layer | undefined;
  message: string;
  name: string;
};

/**
 * Success/failure envelope compatible with React `useActionState`.
 *
 * @typeParam T - Type of the `data` field; should usually be an {@link ActionData} union.
 * @typeParam E - Error payload type; defaults to {@link ActionError}.
 * @public
 * @remarks
 * - The success shape is `{ ok: true, data }`.
 * - The failure shape is `{ ok: false, error }`.
 * - In some generic compositions this type can collapse to `never` to represent an impossible branch; at runtime you only handle the success and failure shapes.
 */
export type ActionState<
  T extends ActionData = UnknownRecord,
  E extends ActionError = ActionError,
> = { data: T; ok: true } | { error: E; ok: false } | never;

/**
 * Build a failure {@link ActionState}.
 *
 * @public
 * @param error - A string, Error, or pre-shaped {@link ActionError}.
 * @returns An {@link ActionState} with `ok: false` and serializable error metadata.
 * @remarks
 * - Strings and pre-shaped {@link ActionError} values are passed through.
 * - Native `Error` instances are converted into {@link ActionError}. For
 *   {@link RichError}, `code` and `i18n` are preserved.
 */
export function err<E extends Error>(
  error: ActionError | E | string,
): ActionState {
  return {
    error:
      typeof error === "string"
        ? newActionError(error)
        : error instanceof Error
          ? toActionError(error)
          : error,
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

/**
 * Construct a minimal {@link ActionError}.
 *
 * @internal
 */
function newActionError(message: string, name?: string): ActionError {
  return {
    name: name || "ActionError",
    message: message || "",
  };
}

function toActionError(error: Error): ActionError {
  const actionError = newActionError(userMessageFromError(error), error.name);
  if (!isRichError(error)) {
    return actionError;
  }

  return {
    ...actionError,
    code: error.code,
    i18n: error.i18n,
    kind: error.kind,
    layer: error.layer,
  };
}
