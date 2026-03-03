import type { ResultAsync } from "neverthrow";

import { parseWith, type RichError } from "@o3osatoshi/toolkit";

import { requestAuthenticatedApi } from "../../common/http/authenticated-api-request";
import { toAsync } from "../../common/result";
import {
  type PrincipalResponse,
  principalSchema,
} from "./contracts/principal.schema";

export function fetchMe(): ResultAsync<PrincipalResponse, RichError> {
  return requestAuthenticatedApi("/api/cli/v1/me", {
    method: "GET",
  }).andThen((json) =>
    toAsync(
      parseWith(principalSchema, {
        action: "DecodeCliPrincipalResponse",
        layer: "Presentation",
      })(json),
    ),
  );
}
