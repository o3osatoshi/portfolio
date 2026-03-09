import { errAsync, okAsync, ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import { makeCliSchemaParser } from "../../common/zod-validation";
import {
  type OidcDiscoveryResponse,
  oidcDiscoveryResponseSchema,
} from "./contracts/oidc.schema";
import { newOidcError, type OidcErrorOptions } from "./oidc-error";

export type ParseSchemaOptions = {
  action: string;
  code: string;
  context: string;
  fallbackHint?: string | undefined;
};

export function discover(
  issuer: string,
  errorCode: string,
): ResultAsync<OidcDiscoveryResponse, RichError> {
  const normalized = issuer.endsWith("/") ? issuer.slice(0, -1) : issuer;
  return fetchResponse(
    `${normalized}/.well-known/openid-configuration`,
    undefined,
    {
      action: "FetchOidcDiscoveryDocument",
      code: errorCode,
      kind: "BadGateway",
      reason: "Failed to fetch OIDC discovery document.",
    },
  )
    .andThen((response) =>
      expectOkResponse(response, {
        action: "FetchOidcDiscoveryDocument",
        code: errorCode,
        kind: "BadGateway",
        reason: "Failed to fetch OIDC discovery document.",
      }),
    )
    .andThen((response) =>
      readJson(response, {
        action: "ReadOidcDiscoveryResponseBody",
        code: errorCode,
        kind: "BadGateway",
        reason: "Failed to read OIDC discovery response body.",
      }),
    )
    .andThen((json) =>
      parseWithSchemaAsync(oidcDiscoveryResponseSchema, json, {
        action: "DecodeOidcDiscoveryResponse",
        code: errorCode,
        context: "OIDC discovery response",
        fallbackHint: "Verify OIDC issuer configuration and retry.",
      }),
    );
}

export function expectOkResponse(
  response: Response,
  options: OidcErrorOptions,
): ResultAsync<Response, RichError> {
  if (!response.ok) {
    return errAsync(
      newOidcError({
        ...options,
        reason: `${options.reason} (${response.status})`,
      }),
    );
  }
  return okAsync(response);
}

export function fetchResponse(
  url: string,
  init?: RequestInit,
  options?: OidcErrorOptions,
): ResultAsync<Response, RichError> {
  const errorOptions = options ?? {
    action: "FetchOidcEndpoint",
    code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
    kind: "BadGateway" as const,
    reason: "Failed to reach the OIDC endpoint.",
  };

  return ResultAsync.fromPromise(fetch(url, init), (cause) =>
    newOidcError(errorOptions, cause),
  );
}

export function readJson(
  response: Response,
  options: OidcErrorOptions,
): ResultAsync<unknown, RichError> {
  return ResultAsync.fromPromise(response.json(), (cause) =>
    newOidcError(options, cause),
  );
}

export function readText(
  response: Response,
  options: OidcErrorOptions,
): ResultAsync<string, RichError> {
  return ResultAsync.fromPromise(response.text(), (cause) =>
    newOidcError(options, cause),
  );
}

function parseWithSchemaAsync<
  TSchema extends Parameters<typeof makeCliSchemaParser>[0],
>(schema: TSchema, input: unknown, options: ParseSchemaOptions) {
  const parsed = makeCliSchemaParser(schema, options)(input);
  return parsed.isOk() ? okAsync(parsed.value) : errAsync(parsed.error);
}
