import { getTranslations } from "next-intl/server";

import type { SerializedRichError } from "@o3osatoshi/toolkit";

import { resolveLocalizedErrorMessage } from "./error-message";

export async function resolveLocalizedErrorMessageServer(
  error: Error | SerializedRichError,
  locale: string,
): Promise<string> {
  const tCommon = await getTranslations({ namespace: "Common", locale });
  const tError = await getTranslations({ locale });

  return resolveLocalizedErrorMessage(error, {
    fallbackMessage: tCommon("unknownError"),
    t: tError,
  });
}
