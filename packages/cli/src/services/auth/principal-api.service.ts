import type { ResultAsync } from "neverthrow";

import { makeSchemaParser, type RichError } from "@o3osatoshi/toolkit";

import { requestAuthenticatedApiWithParser } from "../../common/http/authenticated-api-request";
import {
  type AccessTokenPrincipal,
  accessTokenPrincipalSchema,
} from "./contracts/principal.schema";

export function fetchAccessTokenPrincipal(): ResultAsync<
  AccessTokenPrincipal,
  RichError
> {
  return requestAuthenticatedApiWithParser(
    "/api/cli/v1/me",
    {
      method: "GET",
    },
    makeSchemaParser(accessTokenPrincipalSchema, {
      action: "DecodeAccessTokenPrincipalResponse",
      layer: "Presentation",
    }),
  );
}
