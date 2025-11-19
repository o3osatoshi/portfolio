import type { InferResponseType } from "@repo/interface/rpc-client";
import { errAsync, ResultAsync } from "neverthrow";

import { getPath } from "@/utils/nav-handler";
import { createEdgeClient, createHeadersOption } from "@/utils/rpc-client";
import { deserializeError, newFetchError } from "@o3osatoshi/toolkit";

export type Me = InferResponseType<
  ReturnType<typeof createEdgeClient>["edge"]["private"]["me"]["$get"],
  200
>;

export function getMe(): ResultAsync<Me, Error> {
  const client = createEdgeClient();
  const request = { method: "GET", url: getPath("me") };

  return createHeadersOption()
    .andThen((headersOption) =>
      ResultAsync.fromPromise(
        client.edge.private.me.$get(undefined, {
          ...headersOption,
          init: { next: { tags: [getPath("me")] } },
        }),
        (cause) => newFetchError({ action: "Fetch me", cause, request }),
      ),
    )
    .andThen((res) => {
      if (res.status === 401) {
        return errAsync(newFetchError({ kind: "Unauthorized", request }));
      }

      if (!res.ok) {
        return ResultAsync.fromPromise(res.json(), (cause) =>
          newFetchError({
            action: "Deserialize error body for getMe",
            cause,
            kind: "Serialization",
            request,
          }),
        ).andThen((body) => errAsync(deserializeError(body)));
      }

      return ResultAsync.fromPromise(res.json(), (cause) =>
        newFetchError({
          action: "Deserialize body for getMe",
          cause,
          kind: "Serialization",
          request,
        }),
      );
    });
}
