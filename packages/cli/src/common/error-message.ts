import type { RichError } from "@o3osatoshi/toolkit";

import {
  type CliValidationIssue,
  extractCliValidationIssues,
} from "./zod-validation";

export type CliErrorPayload = {
  error: {
    action?: string | undefined;
    code?: string | undefined;
    issues?: CliValidationIssue[] | undefined;
    kind: string;
    layer: string;
    message: string;
    reason?: string | undefined;
  };
  ok: false;
};

type CliErrorRenderOptions = {
  debug?: boolean | undefined;
};

export function toCliErrorMessage(
  error: RichError,
  options: CliErrorRenderOptions = {},
): string {
  const message = toCliErrorShortMessage(error);
  const base = !error.code ? message : `${message} (code=${error.code})`;
  if (!options.debug) {
    return base;
  }

  const issues = extractCliValidationIssues(error);
  if (issues.length === 0) {
    return base;
  }

  const lines = [base, "Details:"];
  for (const issue of issues) {
    lines.push(`- ${issue.path}: ${issue.message} (code=${issue.code})`);
  }

  const hint = error.details?.hint?.trim();
  if (hint) {
    lines.push(`Try: ${hint}`);
  }

  return lines.join("\n");
}

export function toCliErrorPayload(
  error: RichError,
  options: CliErrorRenderOptions = {},
): CliErrorPayload {
  const issues = options.debug ? extractCliValidationIssues(error) : [];

  return {
    error: {
      action: error.details?.action,
      code: error.code,
      ...(issues.length > 0 ? { issues } : {}),
      kind: error.kind,
      layer: error.layer,
      message: toCliErrorShortMessage(error),
      reason: error.details?.reason,
    },
    ok: false,
  };
}

function toCliErrorShortMessage(error: RichError): string {
  return error.details?.reason?.trim() || error.message.trim();
}
