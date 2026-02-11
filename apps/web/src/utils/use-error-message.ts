"use client";

import { useTranslations } from "next-intl";
import { useCallback } from "react";

import {
  type ErrorMessageFallback,
  interpretErrorMessage,
  type RichError,
  type SerializedRichError,
} from "@o3osatoshi/toolkit";

export type UseErrorMessageOptions = {
  fallback?: ErrorMessageFallback | undefined;
};

export function useErrorMessage(options: UseErrorMessageOptions = {}) {
  const t = useTranslations();

  return useCallback(
    (error: RichError | SerializedRichError) =>
      interpretErrorMessage(error, {
        fallback: options.fallback,
        t,
      }),
    [t, options.fallback],
  );
}
