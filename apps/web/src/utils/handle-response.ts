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
        cause,
        details: { action: `Deserialize error body for ${context}` },
        kind: "Serialization",
        request,
      }),
    ).andThen((body) =>
      errAsync(
        deserializeError(body, {
          fallback: (cause) =>
            newFetchError({
              cause,
              details: { action: `Deserialize error body for ${context}` },
              kind: "BadGateway",
              request,
            }),
        }),
      ),
    );
  }

  return ResultAsync.fromPromise(res.json(), (cause) =>
    newFetchError({
      cause,
      details: { action: `Deserialize body for ${context}` },
      kind: "Serialization",
      request,
    }),
  );
}
