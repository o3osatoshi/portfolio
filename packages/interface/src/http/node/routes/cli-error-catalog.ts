export const cliErrorCodes = {
  BEARER_TOKEN_MALFORMED: "CLI_BEARER_TOKEN_MALFORMED",
  BEARER_TOKEN_MISSING: "CLI_BEARER_TOKEN_MISSING",
  REQUEST_BODY_INVALID: "CLI_REQUEST_BODY_INVALID",
  SCOPE_FORBIDDEN: "CLI_SCOPE_FORBIDDEN",
} as const;

export type CliErrorCode = (typeof cliErrorCodes)[keyof typeof cliErrorCodes];
