import type { RichErrorI18n, SerializedRichError } from "@o3osatoshi/toolkit";

type Options = {
  fallbackMessage: string;
  t: Translate;
};

type Translate = (
  key: string,
  values?: Record<string, Date | number | string>,
) => string;

export function interpretErrorMessage(
  error: Error | SerializedRichError,
  { fallbackMessage, t }: Options,
): string {
  const i18n = extractI18n(error);
  if (!i18n?.key) {
    return fallbackMessage;
  }

  try {
    return t(i18n.key, toTranslationParams(i18n.params));
  } catch {
    return fallbackMessage;
  }
}

function extractI18n(
  error: Error | SerializedRichError,
): RichErrorI18n | undefined {
  if ("i18n" in error) {
    return error.i18n;
  }

  return undefined;
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
