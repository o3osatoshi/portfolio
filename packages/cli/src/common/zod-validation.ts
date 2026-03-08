import type { Result } from "neverthrow";
import type { z } from "zod";

import {
  isRecord,
  makeSchemaParser,
  newRichError,
  type RichError,
  type ValidationIssue,
} from "@o3osatoshi/toolkit";

type CliSchemaParserOptions = {
  action: string;
  code: string;
  context: string;
  fallbackHint?: string | undefined;
};

const defaultHint = "Review the input and retry.";

export function extractValidationIssues(error: RichError): ValidationIssue[] {
  const value = error.meta?.["validationIssues"];
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!isRecord(entry)) {
      return [];
    }

    const path = typeof entry["path"] === "string" ? entry["path"] : undefined;
    const message =
      typeof entry["message"] === "string" ? entry["message"] : undefined;
    const code = typeof entry["code"] === "string" ? entry["code"] : undefined;
    if (!path || !message || !code) {
      return [];
    }

    return [
      {
        code,
        message,
        path,
      },
    ];
  });
}

export function makeCliSchemaParser<T extends z.ZodType>(
  schema: T,
  options: CliSchemaParserOptions,
): (input: unknown) => Result<z.infer<T>, RichError> {
  return makeSchemaParser(schema, {
    includeValidationIssues: true,
    action: options.action,
    code: options.code,
    layer: "Presentation",
    mapError: (error) => {
      const baseReason = error.details?.reason?.trim();
      const baseHint = error.details?.hint?.trim();
      const reason = baseReason
        ? `Invalid ${options.context}: ${baseReason}`
        : `Invalid ${options.context}.`;

      return newRichError({
        cause: error.cause,
        code: options.code,
        details: {
          ...error.details,
          action: options.action,
          hint: baseHint || options.fallbackHint || defaultHint,
          reason,
        },
        i18n: error.i18n,
        isOperational: error.isOperational,
        kind: error.kind,
        layer: error.layer,
        meta: error.meta,
      });
    },
  });
}
