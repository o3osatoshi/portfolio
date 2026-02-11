import { getTranslations } from "next-intl/server";

import {
  type ErrorMessageFallback,
  interpretErrorMessage,
  type RichError,
  type SerializedRichError,
} from "@o3osatoshi/toolkit";

export type ResolveErrorMessageOptions = {
  fallback?: ErrorMessageFallback | undefined;
};

export async function resolveErrorMessage(
  error: RichError | SerializedRichError,
  locale: string,
  options: ResolveErrorMessageOptions = {},
): Promise<string> {
  const t = await getTranslations({ locale });

  return interpretErrorMessage(error, {
    fallback: options.fallback,
    t,
  });
}
