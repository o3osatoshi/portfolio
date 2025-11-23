import { errAsync, ResultAsync } from "neverthrow";

import { deserializeError, newFetchError } from "@o3osatoshi/toolkit";

type HandleResponseOptions = {
  context: string;
  request: Request;
};

type Request = {
  method: string;
  url: string;
};

export function handleResponse<T>(
  res: Response,
  { context, request }: HandleResponseOptions,
): ResultAsync<T, Error> {
  if (res.status === 401) {
    return errAsync(newFetchError({ kind: "Unauthorized", request }));
  }

  if (!res.ok) {
    return ResultAsync.fromPromise(res.json(), (cause) =>
      newFetchError({
        action: `Deserialize error body for ${context}`,
        cause,
        kind: "Serialization",
        request,
      }),
    ).andThen((body) => errAsync(deserializeError(body)));
  }

  return ResultAsync.fromPromise(res.json(), (cause) =>
    newFetchError({
      action: `Deserialize body for ${context}`,
      cause,
      kind: "Serialization",
      request,
    }),
  );
}
