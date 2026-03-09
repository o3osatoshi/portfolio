import type { Result } from "neverthrow";
import type { z } from "zod";

import {
  makeSchemaParser,
  newRichError,
  type RichError,
} from "@o3osatoshi/toolkit";

type CliSchemaParserOptions = {
  action: string;
  code: string;
  context: string;
  fallbackHint?: string | undefined;
};

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
          hint:
            baseHint || options.fallbackHint || "Review the input and retry.",
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
