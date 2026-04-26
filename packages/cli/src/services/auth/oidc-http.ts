import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { fetchJson } from "../../common/http/fetch";
import {
  type OidcDiscoveryResponse,
  oidcDiscoveryResponseSchema,
} from "./contracts/oidc.schema";

export function fetchOidcDiscovery(
  issuer: string,
  errorCode: string,
): ResultAsync<OidcDiscoveryResponse, RichError> {
  const normalizedIssuer = issuer.endsWith("/") ? issuer.slice(0, -1) : issuer;
  return fetchJson({
    decode: {
      context: {
        action: "DecodeOidcDiscoveryResponse",
        code: errorCode,
        context: "OIDC discovery response",
        fallbackHint: "Verify OIDC issuer configuration and retry.",
      },
      schema: oidcDiscoveryResponseSchema,
    },
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
    url: `${normalizedIssuer}/.well-known/openid-configuration`,
  });
}
