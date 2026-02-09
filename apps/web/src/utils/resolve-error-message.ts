import { getTranslations } from "next-intl/server";

import type { SerializedRichError } from "@o3osatoshi/toolkit";

import { interpretErrorMessage } from "./error-message";

export async function resolveErrorMessage(
  error: Error | SerializedRichError,
  locale: string,
): Promise<string> {
  const tCommon = await getTranslations({ namespace: "Common", locale });
  const tError = await getTranslations({ locale });

  return interpretErrorMessage(error, {
    fallbackMessage: tCommon("unknownError"),
    t: tError,
  });
}
