import type { ResultAsync } from "neverthrow";

import { type RichError, serialize } from "@o3osatoshi/toolkit";

import { type OutputMode, printSuccessData } from "../../common/output";
import { fetchAccessTokenPrincipal } from "../../services/auth/principal-api.service";

export function runAuthWhoami(
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  return fetchAccessTokenPrincipal()
    .andTee((principal) => {
      printSuccessData("auth.whoami", principal, outputMode, (data) => {
        const serialized = serialize(data, { space: 2 });
        if (serialized.isErr()) {
          console.log(String(data));
          return;
        }
        console.log(serialized.value);
      });
    })
    .map(() => undefined);
}
