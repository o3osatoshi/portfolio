import { userMessageFromError } from "./error-message";

/**
 * Data payload accepted by {@link ActionState}. Matches the shape that React
 * `useActionState` prefers for server actions.
 *
 * @public
 */
export type ActionData<T extends Object = Object> =
  | never
  | null
  | T
  | undefined;

/**
 * Minimal error shape delivered to the client side; keeps stack/cause out of the response.
 *
 * @public
 */
export type ActionError = {
  message: string;
  name: string;
};

/**
 * Success/failure envelope compatible with React `useActionState`.
 *
 * @public
 * @remarks
 * - The success shape is `{ ok: true, data }`.
 * - The failure shape is `{ ok: false, error }`.
 */
export type ActionState<
  T extends ActionData = Object,
  E extends ActionError = ActionError,
> = { data: T; ok: true } | { error: E; ok: false };

type Object = Record<string, unknown>;

/**
 * Build a failure {@link ActionState} with a user-facing error message.
 *
 * @public
 * @param error - A string, {@link Error}, or pre-shaped {@link ActionError}.
 * @returns An {@link ActionState} with `ok: false` and a friendly message derived from the error.
 * @remarks
 * - Strings and pre-shaped {@link ActionError} values are passed through.
 * - Native `Error` instances are converted via {@link userMessageFromError} to keep messages user-friendly.
 */
export function err<E extends Error>(
  error: ActionError | E | string,
): ActionState {
  return {
    error:
      typeof error === "string"
        ? newActionError(error)
        : error instanceof Error
          ? newActionError(userMessageFromError(error), error.name)
          : error,
    ok: false,
  };
}

/**
 * Build a success {@link ActionState}.
 *
 * @public
 * @param data - Arbitrary payload you want to return to the caller.
 * @returns An {@link ActionState} with `ok: true` and the supplied data.
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
