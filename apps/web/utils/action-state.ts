type Object = Record<string, unknown>;

export type ActionData<T extends Object = Object> =
  | never
  | null
  | undefined
  | T;

export type ActionError = {
  name: string;
  message: string;
};

function newError(message: string, name?: string): ActionError {
  return {
    name: name || "ActionError",
    message: message || "",
  };
}

export type ActionState<
  T extends ActionData = Object,
  E extends ActionError = ActionError,
> = { ok: true; data: T } | { ok: false; error: E };

export function ok<T extends ActionData>(data: T): ActionState<T, never> {
  return { ok: true, data };
}

export function err<E extends Error>(
  error: string | E | ActionError,
): ActionState<never, ActionError> {
  return {
    ok: false,
    error:
      typeof error === "string"
        ? newError(error)
        : error instanceof Error
          ? newError(error.name, error.message)
          : error,
  };
}
