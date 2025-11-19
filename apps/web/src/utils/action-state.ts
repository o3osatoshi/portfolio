export type ActionData<T extends Object = Object> =
  | never
  | null
  | T
  | undefined;

export type ActionError = {
  message: string;
  name: string;
};

export type ActionState<
  T extends ActionData = Object,
  E extends ActionError = ActionError,
> = { data: T; ok: true } | { error: E; ok: false };

type Object = Record<string, unknown>;

export function err<E extends Error>(
  error: ActionError | E | string,
): ActionState {
  return {
    error:
      typeof error === "string"
        ? newActionError(error)
        : error instanceof Error
          ? newActionError(error.name, error.message)
          : error,
    ok: false,
  };
}

export function ok<T extends ActionData>(data: T): ActionState<T, never> {
  return { data, ok: true };
}

function newActionError(message: string, name?: string): ActionError {
  return {
    name: name || "ActionError",
    message: message || "",
  };
}
