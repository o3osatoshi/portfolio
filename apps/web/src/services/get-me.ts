import type { InferResponseType } from "@repo/interface/rpc-client";
import { err, ok } from "neverthrow";

import { getPath } from "@/utils/nav-handler";
import { createEdgeClient, createHeadersOption } from "@/utils/rpc-client";
import { deserializeError, newFetchError } from "@o3osatoshi/toolkit";

const client = createEdgeClient();
const $getMe = client.edge.private.me.$get;

export type Me = InferResponseType<typeof $getMe, 200>;

export async function getMe() {
  const headersOption = await createHeadersOption();
  const res = await $getMe(undefined, {
    ...headersOption,
    init: {
      next: {
        tags: [getPath("me")],
      },
    },
  });
  if (res.status === 401) {
    return err(
      newFetchError({
        kind: "Unauthorized",
        request: {
          method: "GET",
          url: getPath("me"),
        },
      }),
    );
  }
  if (!res.ok) {
    const body = await res.json();
    return err(deserializeError(body));
  }
  return ok(await res.json());
}
