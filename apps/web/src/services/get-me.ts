import type { InferResponseType } from "@repo/interface/rpc-client";
import { ResultAsync } from "neverthrow";

import { handleResponse } from "@/utils/handle-response";
import { getPath } from "@/utils/nav-handler";
import { createEdgeClient, createHeaders } from "@/utils/rpc-client";
import { newFetchError } from "@o3osatoshi/toolkit";

export type Me = InferResponseType<
  ReturnType<typeof createEdgeClient>["edge"]["private"]["me"]["$get"],
  200
>;

export function getMe(): ResultAsync<Me, Error> {
  const client = createEdgeClient();
  const request = { method: "GET", url: getPath("me") };

  return createHeaders()
    .andThen((headers) =>
      ResultAsync.fromPromise(
        client.edge.private.me.$get(undefined, {
          ...headers,
          init: { next: { tags: [getPath("me")] } },
        }),
        (cause) => newFetchError({ action: "Fetch me", cause, request }),
      ),
    )
    .andThen((res) =>
      handleResponse<Me>(res, {
        context: "getMe",
        request,
      }),
    );
}
