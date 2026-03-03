import { err, ok, type Result } from "neverthrow";
import type { z } from "zod";

import {
  isZodError,
  newRichError,
  parseWith,
  type RichError,
  summarizeZodIssue,
} from "@o3osatoshi/toolkit";

export type CliValidationIssue = {
  code: string;
  expected?: string | undefined;
  message: string;
  path: string;
  receivedType?: string | undefined;
};

type ParseCliWithSchemaOptions = {
  action: string;
  code: string;
  context: string;
  fallbackHint?: string | undefined;
};

const defaultHint = "Review the input and retry.";

export function extractCliValidationIssues(
  error: RichError,
): CliValidationIssue[] {
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

    const expected =
      typeof entry["expected"] === "string" ? entry["expected"] : undefined;
    const receivedType =
      typeof entry["receivedType"] === "string"
        ? entry["receivedType"]
        : undefined;

    return [
      {
        code,
        ...(expected ? { expected } : {}),
        message,
        path,
        ...(receivedType ? { receivedType } : {}),
      },
    ];
  });
}

export function parseCliWithSchema<T extends z.ZodType>(
  schema: T,
  input: unknown,
  options: ParseCliWithSchemaOptions,
): Result<z.infer<T>, RichError> {
  const parsed = parseWith(schema, {
    action: options.action,
    layer: "Presentation",
  })(input);

  if (parsed.isOk()) {
    return ok(parsed.value);
  }

  const cause = (parsed.error as { cause?: unknown }).cause;
  const validationIssues = toValidationIssues(cause);
  const summary = toValidationSummary(cause);

  return err(
    newRichError({
      cause,
      code: options.code,
      details: {
        action: options.action,
        hint: parsed.error.details?.hint ?? options.fallbackHint ?? defaultHint,
        reason: summary
          ? `Invalid ${options.context}: ${summary}`
          : `Invalid ${options.context}.`,
      },
      isOperational: true,
      kind: "Validation",
      layer: "Presentation",
      ...(validationIssues.length > 0
        ? {
            meta: {
              validationIssues: validationIssues.map((issue) => ({
                code: issue.code,
                ...(issue.expected ? { expected: issue.expected } : {}),
                message: issue.message,
                path: issue.path,
                ...(issue.receivedType
                  ? { receivedType: issue.receivedType }
                  : {}),
              })),
            },
          }
        : {}),
    }),
  );
}

function inferReceivedType(input: unknown): string {
  if (input === null) {
    return "null";
  }
  if (Array.isArray(input)) {
    return "array";
  }
  if (input instanceof Date) {
    return "date";
  }
  return typeof input;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toValidationIssues(cause: unknown): CliValidationIssue[] {
  if (!isZodError(cause)) {
    return [];
  }

  return cause.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    const expectedValue = (issue as { expected?: unknown }).expected;
    const inputValue = (issue as { input?: unknown }).input;

    return {
      code: String(issue.code),
      ...(expectedValue !== undefined
        ? { expected: String(expectedValue) }
        : {}),
      message: issue.message,
      path,
      ...(inputValue !== undefined
        ? { receivedType: inferReceivedType(inputValue) }
        : {}),
    };
  });
}

function toValidationSummary(cause: unknown): string | undefined {
  if (!isZodError(cause) || cause.issues.length === 0) {
    return undefined;
  }

  return cause.issues.map((issue) => summarizeZodIssue(issue)).join("; ");
}
