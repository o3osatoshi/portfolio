import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { fetchAuthedJson } from "../../common/http/authenticated-api-fetch";
import {
  type AccessTokenPrincipal,
  accessTokenPrincipalSchema,
} from "./contracts/principal.schema";

export function fetchAccessTokenPrincipal(): ResultAsync<
  AccessTokenPrincipal,
  RichError
> {
  return fetchAuthedJson({
    decode: {
      context: {
        action: "DecodeAccessTokenPrincipalResponse",
        layer: "Presentation",
      },
      schema: accessTokenPrincipalSchema,
    },
    method: "GET",
    path: "/api/cli/v1/me",
  });
}
