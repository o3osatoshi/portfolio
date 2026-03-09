import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { requestHttp } from "../../common/http/http-request";
import { requestHttpJsonWithParser } from "../../common/http/http-response";
import { makeCliSchemaParser } from "../../common/zod-validation";
import {
  type OidcDiscoveryResponse,
  oidcDiscoveryResponseSchema,
} from "./contracts/oidc.schema";
import type { OidcErrorOptions } from "./oidc-error";

export function discover(
  issuer: string,
  errorCode: string,
): ResultAsync<OidcDiscoveryResponse, RichError> {
  const normalizedIssuer = issuer.endsWith("/") ? issuer.slice(0, -1) : issuer;
  return requestHttpJsonWithParser(
    `${normalizedIssuer}/.well-known/openid-configuration`,
    undefined,
    {
      parser: makeCliSchemaParser(oidcDiscoveryResponseSchema, {
        action: "DecodeOidcDiscoveryResponse",
        code: errorCode,
        context: "OIDC discovery response",
        fallbackHint: "Verify OIDC issuer configuration and retry.",
      }),
      read: {
        action: "ReadOidcDiscoveryResponseBody",
        code: errorCode,
        kind: "BadGateway",
        reason: "Failed to read OIDC discovery response body.",
      },
      request: {
        action: "FetchOidcDiscoveryDocument",
        code: errorCode,
        kind: "BadGateway",
        reason: "Failed to fetch OIDC discovery document.",
      },
    },
  );
}

export function oidcFetch(
  url: string,
  init: RequestInit | undefined,
  options: OidcErrorOptions,
): ResultAsync<Response, RichError> {
  return requestHttp(url, init, options);
}
