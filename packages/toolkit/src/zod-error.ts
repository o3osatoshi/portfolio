import { type ZodError, type ZodIssue, ZodIssueCode, z } from "zod";
import { newError as baseNewError } from "./error";

function issueMessage(issue: ZodIssue): string {
  switch (issue.code) {
    case ZodIssueCode.invalid_type: {
      return `Expected ${String(issue.expected)}, received ${String(issue.received)}`;
    }
    case ZodIssueCode.invalid_literal: {
      return `Invalid literal, expected ${JSON.stringify(issue.expected)}`;
    }
    case ZodIssueCode.unrecognized_keys: {
      return `Unrecognized keys: ${(issue.keys || []).join(", ")}`;
    }
    case ZodIssueCode.invalid_union: {
      const first = issue.unionErrors?.[0]?.issues?.[0];
      const hint = first ? ` (${summarizeZodIssue(first)})` : "";
      return `Invalid value for union type${hint}`;
    }
    case ZodIssueCode.invalid_union_discriminator: {
      const opts = Array.isArray(issue.options)
        ? issue.options.join(", ")
        : String(issue.options);
      const received = (issue as unknown as { received?: unknown }).received;
      return received !== undefined
        ? `Invalid discriminator value: ${String(received)} (expected one of: ${opts})`
        : `Invalid discriminator value (expected one of: ${opts})`;
    }
    case ZodIssueCode.invalid_enum_value: {
      const opts = Array.isArray(issue.options)
        ? issue.options.join(", ")
        : String(issue.options);
      return `Invalid enum value, expected one of: ${opts}`;
    }
    case ZodIssueCode.invalid_arguments: {
      return "Invalid function arguments";
    }
    case ZodIssueCode.invalid_return_type: {
      return "Invalid function return type";
    }
    case ZodIssueCode.invalid_date: {
      return "Invalid date";
    }
    case ZodIssueCode.invalid_string: {
      if (typeof issue.validation === "object") return "Invalid string";
      return `Invalid string (${issue.validation})`;
    }
    case ZodIssueCode.too_small: {
      const what = issue.type;
      const min = issue.minimum;
      const incl = issue.inclusive ? "(inclusive)" : "";
      return `Too small ${what}: min ${min} ${incl}`.trim();
    }
    case ZodIssueCode.too_big: {
      const what = issue.type;
      const max = issue.maximum;
      const incl = issue.inclusive ? "(inclusive)" : "";
      return `Too big ${what}: max ${max} ${incl}`.trim();
    }
    case ZodIssueCode.not_multiple_of: {
      return `Not a multiple of ${issue.multipleOf}`;
    }
    case ZodIssueCode.not_finite: {
      return "Number must be finite";
    }
    case ZodIssueCode.custom: {
      return issue.message || "Invalid value";
    }
    case ZodIssueCode.invalid_intersection_types: {
      return "Invalid intersection types";
    }
    default: {
      return (issue as { message?: string }).message || "Invalid input";
    }
  }
}

export function summarizeZodIssue(issue: ZodIssue): string {
  const path = issue.path?.length ? issue.path.join(".") : "(root)";
  const msg = issueMessage(issue);
  return `${path}: ${msg}`;
}

export function summarizeZodError(err: ZodError): string {
  return err.issues.map(summarizeZodIssue).join("; ");
}

function inferHintFromIssues(issues: ZodIssue[]): string | undefined {
  const i = issues[0];
  switch (i.code) {
    case ZodIssueCode.unrecognized_keys:
      return "Remove unknown fields from the payload.";
    case ZodIssueCode.invalid_type:
      return "Check field types match the schema.";
    case ZodIssueCode.invalid_enum_value:
      return "Use one of the allowed enum values.";
    case ZodIssueCode.too_small:
      return "Increase value/length to meet the minimum.";
    case ZodIssueCode.too_big:
      return "Reduce value/length to meet the maximum.";
    case ZodIssueCode.invalid_string:
      return "Ensure string matches the required format.";
    case ZodIssueCode.invalid_date:
      return "Provide a valid date value.";
    case ZodIssueCode.not_multiple_of:
      return "Adjust value to a valid multiple.";
    case ZodIssueCode.not_finite:
      return "Use a finite number.";
    default:
      return undefined;
  }
}

export function isZodError(e: unknown): e is ZodError {
  return e instanceof z.ZodError;
}

export type Layer =
  | "Domain"
  | "Application"
  | "Infra"
  | "Auth"
  | "UI"
  | "DB"
  | "External";

export type NewZodError = {
  layer?: Layer; // default Application
  action?: string;
  impact?: string;
  hint?: string;
  cause?: unknown; // ideally a ZodError
  issues?: ZodIssue[];
};

export function newZodError({
  layer = "Application",
  action,
  impact,
  hint,
  cause,
  issues,
}: NewZodError): Error {
  const zIssues: ZodIssue[] | undefined = issues
    ? issues
    : isZodError(cause)
      ? cause.issues
      : undefined;

  const reason =
    zIssues && zIssues.length > 0
      ? zIssues.map(summarizeZodIssue).join("; ")
      : "Invalid request payload";

  const effectiveHint =
    hint ?? (zIssues ? inferHintFromIssues(zIssues) : undefined);

  return baseNewError({
    layer,
    kind: "Validation",
    action,
    reason,
    impact,
    hint: effectiveHint,
    cause,
  });
}
