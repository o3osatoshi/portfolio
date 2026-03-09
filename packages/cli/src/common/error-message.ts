import {
  extractValidationIssues,
  type RichError,
  type ValidationIssue,
} from "@o3osatoshi/toolkit";

export type CliErrorPayload = {
  error: {
    action?: string | undefined;
    code?: string | undefined;
    issues?: undefined | ValidationIssue[];
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

export function toFailureMessage(
  error: RichError,
  options: CliErrorRenderOptions = {},
): string {
  const message = toFailureShortMessage(error);
  const baseMessage = !error.code ? message : `${message} (code=${error.code})`;
  if (!options.debug) {
    return baseMessage;
  }

  const issues = extractValidationIssues(error);
  if (issues.length === 0) {
    return baseMessage;
  }

  const lines = [baseMessage, "Details:"];
  for (const issue of issues) {
    lines.push(`- ${issue.path}: ${issue.message} (code=${issue.code})`);
  }

  const hint = error.details?.hint?.trim();
  if (hint) {
    lines.push(`Try: ${hint}`);
  }

  return lines.join("\n");
}

export function toFailurePayload(
  error: RichError,
  options: CliErrorRenderOptions = {},
): CliErrorPayload {
  const issues = options.debug ? extractValidationIssues(error) : [];

  return {
    error: {
      action: error.details?.action,
      code: error.code,
      ...(issues.length > 0 ? { issues } : {}),
      kind: error.kind,
      layer: error.layer,
      message: toFailureShortMessage(error),
      reason: error.details?.reason,
    },
    ok: false,
  };
}

function toFailureShortMessage(error: RichError): string {
  return error.details?.reason?.trim() || error.message.trim();
}
