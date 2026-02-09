import {
  type ActionError,
  isRichError,
  type RichErrorI18n,
} from "@o3osatoshi/toolkit";

type Options = {
  fallbackMessage: string;
  t: Translate;
};

type Translate = (
  key: string,
  values?: Record<string, Date | number | string>,
) => string;

export function resolveLocalizedErrorMessage(
  error: ActionError | Error,
  { fallbackMessage, t }: Options,
): string {
  const i18n = extractI18n(error);
  if (i18n?.key) {
    try {
      return t(i18n.key, toTranslationParams(i18n.params));
    } catch {
      // fall through to message fallback when key is missing
    }
  }

  const message = extractMessage(error);
  if (message) {
    return message;
  }

  return fallbackMessage;
}

function extractI18n(error: ActionError | Error): RichErrorI18n | undefined {
  if (isRichError(error)) {
    return error.i18n;
  }

  if ("i18n" in error) {
    return error.i18n;
  }

  return undefined;
}

function extractMessage(error: ActionError | Error): string | undefined {
  const message = error.message?.trim();
  if (!message) return undefined;
  return message;
}

function toTranslationParams(
  params: RichErrorI18n["params"] | undefined,
): Record<string, Date | number | string> | undefined {
  if (!params) return undefined;

  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      typeof value === "boolean" ? String(value) : value,
    ]),
  );
}
