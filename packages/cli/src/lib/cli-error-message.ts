import type { RichError } from "@o3osatoshi/toolkit";

export type CliErrorPayload = {
  error: {
    action?: string | undefined;
    code?: string | undefined;
    kind: string;
    layer: string;
    message: string;
    reason?: string | undefined;
  };
  ok: false;
};

export function toCliErrorMessage(error: RichError): string {
  const message = toCliErrorShortMessage(error);
  if (!error.code) {
    return message;
  }
  return `${message} (code=${error.code})`;
}

export function toCliErrorPayload(error: RichError): CliErrorPayload {
  return {
    error: {
      action: error.details?.action,
      code: error.code,
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
