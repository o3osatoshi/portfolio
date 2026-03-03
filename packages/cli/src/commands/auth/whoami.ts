import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { type OutputMode, printSuccessData } from "../../common/output";
import { fetchMe } from "../../services/auth/principal-api.service";

export function runAuthWhoami(
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  return fetchMe().map((me) => {
    printSuccessData("auth.whoami", me, outputMode, (data) => {
      console.log(JSON.stringify(data, null, 2));
    });
    return undefined;
  });
}
