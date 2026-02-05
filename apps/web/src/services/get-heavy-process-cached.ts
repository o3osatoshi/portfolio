import type { InferResponseType } from "@repo/interface/rpc-client";
import { ResultAsync } from "neverthrow";

import { handleResponse } from "@/utils/handle-response";
import { getPath } from "@/utils/nav-handler";
import { createEdgeClient } from "@/utils/rpc-client";
import { newFetchError } from "@o3osatoshi/toolkit";

export type HeavyProcessCached = InferResponseType<
  ReturnType<
    typeof createEdgeClient
  >["edge"]["public"]["heavy"]["cached"]["$get"],
  200
>;

export function getHeavyProcessCached(): ResultAsync<
  HeavyProcessCached,
  Error
> {
  const client = createEdgeClient();
  const request = { method: "GET", url: getPath("heavy-process-cached") };

  // @ts-expect-error
  return ResultAsync.fromPromise(
    client.edge.public.heavy.cached.$get(undefined, {
      init: { cache: "no-store" },
    }),
    (cause) =>
      newFetchError({
        cause,
        details: { action: "Fetch heavy process cached" },
        request,
      }),
  ).andThen((res) =>
    handleResponse<HeavyProcessCached>(res, {
      context: "getHeavyProcessCached",
      request,
    }),
  );
}

// NOTE: get cookie from a client-side example
// function createClientSideHeaders(): Pick<ClientOptions, "headers"> | undefined {
//   if (typeof document === "undefined") return undefined;
//   const cookie = document.cookie;
//   if (!cookie) return undefined;
//   return {
//     headers: () => ({
//       Cookie: cookie,
//     }),
//   };
// }
