export const cliErrorCodes = {
  REQUEST_BODY_INVALID: "CLI_REQUEST_BODY_INVALID",
  BEARER_TOKEN_MISSING: "CLI_BEARER_TOKEN_MISSING",
  BEARER_TOKEN_MALFORMED: "CLI_BEARER_TOKEN_MALFORMED",
  SCOPE_FORBIDDEN: "CLI_SCOPE_FORBIDDEN",
} as const;

export type CliErrorCode = (typeof cliErrorCodes)[keyof typeof cliErrorCodes];
