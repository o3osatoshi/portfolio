"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import type { RichError, SerializedRichError } from "@o3osatoshi/toolkit";

import { interpretErrorMessage } from "./error-message";

export function useErrorMessage() {
  const tCommon = useTranslations("Common");
  const tError = useTranslations();

  return useCallback(
    (error: RichError | SerializedRichError) =>
      interpretErrorMessage(error, {
        fallbackMessage: tCommon("unknownError"),
        t: tError,
      }),
    [tCommon, tError],
  );
}
