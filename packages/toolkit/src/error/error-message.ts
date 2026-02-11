import type { RichError, RichErrorI18n } from "./error";
import type { SerializedRichError } from "./error-serializer";

/**
 * Optional fallback used when translation from error i18n metadata fails.
 *
 * @public
 */
export type ErrorMessageFallback = {
  i18n?: RichErrorI18n | undefined;
  message?: string | undefined;
};

/**
 * Translation function contract accepted by {@link interpretErrorMessage}.
 *
 * @public
 */
export type ErrorMessageTranslator = (
  key: string,
  values?: Record<string, Date | number | string>,
) => string;

/**
 * Options for {@link interpretErrorMessage}.
 *
 * @public
 */
export type InterpretErrorMessageOptions = {
  fallback?: ErrorMessageFallback | undefined;
  t: ErrorMessageTranslator;
};

/**
 * Resolve a user-facing message from RichError i18n metadata.
 *
 * Resolution order:
 * 1. `error.i18n`
 * 2. `fallback.i18n`
 * 3. `fallback.message`
 * 4. `"Unknown error"`
 *
 * @public
 */
export function interpretErrorMessage(
  error: RichError | SerializedRichError,
  { fallback, t }: InterpretErrorMessageOptions,
): string {
  const message = tryTranslate(extractI18n(error), t);
  if (message !== undefined) return message;

  const fallbackMessage = tryTranslate(fallback?.i18n, t);
  if (fallbackMessage !== undefined) return fallbackMessage;

  if (fallback?.message !== undefined) return fallback.message;
  return "Unknown error";
}

function extractI18n(
  error: RichError | SerializedRichError,
): RichErrorI18n | undefined {
  return error.i18n;
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

function tryTranslate(
  i18n: RichErrorI18n | undefined,
  t: ErrorMessageTranslator,
): string | undefined {
  if (!i18n?.key) return undefined;

  try {
    return t(i18n.key, toTranslationParams(i18n.params));
  } catch {
    return undefined;
  }
}
