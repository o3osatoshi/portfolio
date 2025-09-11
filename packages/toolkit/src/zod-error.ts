import { type ZodError, type ZodIssue, z } from "zod";
import { newError as baseNewError } from "./error";

function issueMessage(issue: ZodIssue): string {
  switch (issue.code) {
    case "invalid_type": {
      const expected = String(issue.expected);
      // v4 does not always include `input`; prefer parsing the locale message.
      if (expected === "date") return "Invalid date";
      const msg = issue.message ?? "";
      const m = /received\s+([^,]+)$/i.exec(msg);
      const received = m
        ? m[1]?.trim()
        : issue.input !== undefined
          ? z.util.getParsedType(issue.input)
          : "unknown";
      return `Expected ${expected}, received ${received}`;
    }
    case "invalid_value": {
      const values = issue.values;
      if (values.length <= 1) {
        const v = values[0];
        return `Invalid literal, expected ${JSON.stringify(v)}`;
      }
      return `Invalid enum value, expected one of: ${values.join(", ")}`;
    }
    case "unrecognized_keys": {
      return `Unrecognized keys: ${issue.keys.join(", ")}`;
    }
    case "invalid_union": {
      // If discriminator provided, use it directly
      if (issue.discriminator) {
        const valueOptions = new Set<string>();
        for (const branch of issue.errors) {
          for (const sub of branch) {
            if (sub.code === "invalid_value") {
              // biome-ignore lint/suspicious/useIterableCallbackReturn: allow forEach due to very simple processing
              sub.values.forEach((v) => valueOptions.add(String(v)));
            }
          }
        }
        const opts = Array.from(valueOptions).join(", ");
        return `Invalid discriminator value${opts ? ` (expected one of: ${opts})` : ""}`;
      }
      // unionFallback case (no discriminator field on the top-level issue)
      let candidateKey: string | undefined;
      const allowed = new Set<string>();
      for (const branch of issue.errors) {
        for (const sub of branch) {
          if (
            sub.code === "invalid_value" &&
            sub.path.length === 1 &&
            typeof sub.path[0] === "string"
          ) {
            candidateKey = sub.path[0];
            // biome-ignore lint/suspicious/useIterableCallbackReturn: allow forEach due to very simple processing
            sub.values.forEach((v) => allowed.add(String(v)));
          }
        }
      }
      if (candidateKey && allowed.size > 0) {
        const opts = Array.from(allowed).join(", ");
        return `Invalid discriminator value${opts ? ` (expected one of: ${opts})` : ""}`;
      }
      const first = issue.errors?.[0]?.[0];
      const hint = first ? ` (${summarizeZodIssue(first)})` : "";
      return `Invalid value for union type${hint}`;
    }
    case "invalid_key": {
      return `Invalid key in ${issue.origin}`;
    }
    case "invalid_element": {
      return `Invalid value in ${issue.origin}`;
    }
    case "invalid_format": {
      // Keep legacy-style wording used in tests
      return `Invalid string (${issue.format})`;
    }
    case "too_small": {
      const what = issue.origin;
      const min = issue.minimum;
      const incl = issue.inclusive ? "(inclusive)" : "";
      return `Too small ${what}: min ${min} ${incl}`.trim();
    }
    case "too_big": {
      const what = issue.origin;
      const max = issue.maximum;
      const incl = issue.inclusive ? "(inclusive)" : "";
      return `Too big ${what}: max ${max} ${incl}`.trim();
    }
    case "not_multiple_of": {
      return `Not a multiple of ${issue.divisor}`;
    }
    case "custom": {
      return issue.message || "Invalid value";
    }
    default: {
      return "Invalid input";
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
  switch (i?.code) {
    case "unrecognized_keys":
      return "Remove unknown fields from the payload.";
    case "invalid_type":
      if (i.expected === "date") return "Provide a valid date value.";
      return "Check field types match the schema.";
    case "invalid_value":
      return "Use one of the allowed enum values.";
    case "too_small":
      return "Increase value/length to meet the minimum.";
    case "too_big":
      return "Reduce value/length to meet the maximum.";
    case "invalid_format":
      return "Ensure string matches the required format.";
    case "not_multiple_of":
      return "Adjust value to a valid multiple.";
    default:
      return undefined;
  }
}

export function isZodError(e: unknown): e is ZodError {
  // Prefer instanceof when the same Zod instance is used
  if (e instanceof z.ZodError) return true;
  // Fallback: duck typing for cross-instance or core error class
  const anyE = e as { name?: unknown; issues?: unknown } | null | undefined;
  return (
    !!anyE &&
    (anyE.name === "ZodError" || anyE.name === "$ZodError") &&
    Array.isArray(anyE.issues)
  );
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
  layer?: Layer | undefined; // default Application
  action?: string | undefined;
  impact?: string | undefined;
  hint?: string | undefined;
  cause?: unknown | undefined; // ideally a ZodError
  issues?: ZodIssue[] | undefined;
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
