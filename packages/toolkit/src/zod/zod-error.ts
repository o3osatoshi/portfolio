import { z, type ZodError } from "zod";

import {
  type Layer,
  type NewRichError,
  newRichError,
  resolveOperationalFromKind,
  type RichError,
  type RichErrorDetails,
} from "../error";

/**
 * Options accepted by {@link newZodError} when normalizing validation issues.
 * Designed to mirror {@link NewRichError} while providing Zod-specific hooks.
 *
 * @public
 */
export type NewZodError = {
  /**
   * Original throwable (ideally a `ZodError`) used to derive issues.
   */
  cause?: undefined | unknown;
  /** Optional diagnostic context that will be merged with inferred details. */
  details?: RichErrorDetails | undefined;
  /**
   * Whether to attach normalized validation issues in `meta.validationIssues`.
   * Disabled by default to preserve payload compactness for non-debug flows.
   */
  includeValidationIssues?: boolean | undefined;
  /** Optional operationality override (defaults to Validation semantics). */
  isOperational?: boolean | undefined;
  /** Architectural layer responsible for validation (default `"Application"`). */
  layer?: Layer | undefined;
} & Omit<NewRichError, "details" | "isOperational" | "kind" | "layer">;

/**
 * Minimal serialized validation issue payload suitable for debug surfaces.
 *
 * @public
 */
export type ValidationIssue = {
  code: string;
  message: string;
  path: string;
};

/**
 * Zod issue type used in toolkit helpers.
 *
 * @public
 */
export type ZodIssue = z.core.$ZodIssue;

/**
 * Determines whether a value came from Zod validation.
 *
 * @public
 */
export function isZodError(e: unknown): e is ZodError {
  // Prefer instanceof when the same Zod instance is used
  if (e instanceof z.ZodError) return true;
  // Fallback: duck typing for cross-instance or core error class
  const anyE = isRecord(e) ? e : undefined;
  return (
    !!anyE &&
    (anyE["name"] === "ZodError" || anyE["name"] === "$ZodError") &&
    Array.isArray(anyE["issues"])
  );
}

/**
 * Wraps a Zod validation error and returns a structured toolkit error.
 *
 * @param options - Validation context plus optional override data (see {@link NewZodError}).
 * @public
 */
export function newZodError(options: NewZodError): RichError {
  const {
    includeValidationIssues,
    cause,
    details,
    isOperational,
    layer = "Application",
    ...rest
  } = options;
  const issues = isZodError(cause) ? cause.issues : undefined;

  const reason =
    issues && issues.length > 0
      ? issues.map(summarizeZodIssue).join("; ")
      : "Invalid request payload";

  const validationIssues = toValidationIssues(issues);
  const meta =
    includeValidationIssues && validationIssues.length > 0
      ? {
          ...(rest.meta ?? {}),
          validationIssues,
        }
      : rest.meta;

  return newRichError({
    ...rest,
    cause,
    code: rest.code ?? inferZodCode(issues),
    details: {
      ...details,
      reason: details?.reason ?? reason,
    },
    isOperational: isOperational ?? resolveOperationalFromKind("Validation"),
    kind: "Validation",
    layer,
    meta,
  });
}

/**
 * Summarizes every issue inside a Zod error into a single readable string.
 *
 * @public
 */
export function summarizeZodError(err: ZodError): string {
  return err.issues.map(summarizeZodIssue).join("; ");
}

/**
 * Serializes one Zod issue into the "path: message" format used by the toolkit.
 *
 * @public
 */
export function summarizeZodIssue(issue: ZodIssue): string {
  const path = issue.path?.length ? issue.path.join(".") : "(root)";
  const msg = issueMessage(issue);
  return `${path}: ${msg}`;
}

/**
 * Projects Zod issues into a compact, JSON-safe debug payload.
 *
 * @public
 */
export function toValidationIssues(
  source: undefined | unknown | ZodIssue[],
): ValidationIssue[] {
  const issues = normalizeZodIssues(source);
  if (!issues || issues.length === 0) {
    return [];
  }

  return issues.map((issue) => ({
    code: String(issue.code),
    message: issue.message,
    path: issue.path?.length ? issue.path.join(".") : "(root)",
  }));
}

function collectInvalidUnionOptions(
  issue: Extract<ZodIssue, { code: "invalid_union" }>,
): string[] {
  const values = new Set<string>();
  for (const branch of issue.errors) {
    for (const branchIssue of branch) {
      if (branchIssue.code !== "invalid_value") {
        continue;
      }

      for (const value of branchIssue.values) {
        values.add(String(value));
      }
    }
  }

  return Array.from(values).sort((left, right) => left.localeCompare(right));
}

function inferZodCode(issues: undefined | ZodIssue[]): string {
  const first = issues?.[0];
  if (!first) return "ZOD_VALIDATION_ERROR";

  switch (first.code) {
    case "invalid_format":
      return "ZOD_INVALID_FORMAT";
    case "invalid_type":
      return "ZOD_INVALID_TYPE";
    case "invalid_value":
      return "ZOD_INVALID_VALUE";
    case "invalid_union":
      return "ZOD_INVALID_UNION";
    case "too_big":
      return "ZOD_TOO_BIG";
    case "too_small":
      return "ZOD_TOO_SMALL";
    case "unrecognized_keys":
      return "ZOD_UNRECOGNIZED_KEYS";
    default:
      return "ZOD_VALIDATION_ERROR";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** Generate a concise message for a single Zod issue. */
function issueMessage(issue: ZodIssue): string {
  if (issue.code === "invalid_union") {
    const unionOptions = collectInvalidUnionOptions(issue);
    if (unionOptions.length > 0) {
      return `Invalid input (expected one of: ${unionOptions.join(", ")})`;
    }
  }

  if (typeof issue.message === "string" && issue.message.trim().length > 0) {
    return issue.message;
  }

  return "Invalid input";
}

function normalizeZodIssues(
  source: undefined | unknown | ZodIssue[],
): undefined | ZodIssue[] {
  if (Array.isArray(source)) {
    return source;
  }

  if (isZodError(source)) {
    return source.issues;
  }

  return undefined;
}
