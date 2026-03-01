import type { RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "./cli-error-catalog";

const EXIT_CODE_API_OR_NETWORK = 5;
const EXIT_CODE_FORBIDDEN = 4;
const EXIT_CODE_LOCAL_RUNTIME = 6;
const EXIT_CODE_OTHER = 1;
const EXIT_CODE_UNAUTHORIZED = 3;
const EXIT_CODE_VALIDATION_OR_USAGE = 2;

export function resolveCliExitCode(error: RichError): number {
  const code = error.code;

  if (
    code === cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT ||
    code === cliErrorCodes.CLI_CONFIG_INVALID
  ) {
    return EXIT_CODE_VALIDATION_OR_USAGE;
  }

  if (
    code === cliErrorCodes.CLI_API_UNAUTHORIZED ||
    code === cliErrorCodes.CLI_AUTH_REFRESH_FAILED ||
    error.kind === "Unauthorized"
  ) {
    return EXIT_CODE_UNAUTHORIZED;
  }

  if (error.kind === "Forbidden" || code === "CLI_SCOPE_FORBIDDEN") {
    return EXIT_CODE_FORBIDDEN;
  }

  if (
    code === cliErrorCodes.CLI_API_REQUEST_FAILED ||
    code === cliErrorCodes.CLI_AUTH_LOGIN_FAILED ||
    code === cliErrorCodes.CLI_AUTH_REVOKE_FAILED ||
    error.kind === "BadGateway" ||
    error.kind === "Timeout" ||
    error.kind === "Unavailable"
  ) {
    return EXIT_CODE_API_OR_NETWORK;
  }

  if (
    code === cliErrorCodes.CLI_ENV_FILE_LOAD_FAILED ||
    code === cliErrorCodes.CLI_TOKEN_STORE_BACKEND_UNAVAILABLE ||
    code === cliErrorCodes.CLI_TOKEN_STORE_CLEAR_FAILED ||
    code === cliErrorCodes.CLI_TOKEN_STORE_MIGRATION_FAILED ||
    code === cliErrorCodes.CLI_TOKEN_STORE_READ_FAILED ||
    code === cliErrorCodes.CLI_TOKEN_STORE_WRITE_FAILED
  ) {
    return EXIT_CODE_LOCAL_RUNTIME;
  }

  return EXIT_CODE_OTHER;
}
