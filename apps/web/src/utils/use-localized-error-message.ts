"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import type { SerializedRichError } from "@o3osatoshi/toolkit";

import { resolveLocalizedErrorMessage } from "./error-message";

export function useLocalizedErrorMessage() {
  const tCommon = useTranslations("Common");
  const tError = useTranslations();

  return useCallback(
    (error: Error | SerializedRichError) =>
      resolveLocalizedErrorMessage(error, {
        fallbackMessage: tCommon("unknownError"),
        t: tError,
      }),
    [tCommon, tError],
  );
}
