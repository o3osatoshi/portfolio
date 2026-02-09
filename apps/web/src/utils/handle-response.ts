import { errAsync, ResultAsync } from "neverthrow";

import {
  deserializeRichError,
  newFetchError,
  type RichError,
} from "@o3osatoshi/toolkit";

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
): ResultAsync<T, RichError> {
  if (res.status === 401) {
    return errAsync(newFetchError({ kind: "Unauthorized", request }));
  }

  if (!res.ok) {
    return ResultAsync.fromPromise(res.json(), (cause) =>
      newFetchError({
        cause,
        details: { action: "DeserializeExternalApiErrorBody" },
        kind: "Serialization",
        request,
      }),
    ).andThen((body) =>
      errAsync(
        deserializeRichError(body, {
          action: "DeserializeExternalApiErrorBody",
          layer: "External",
          meta: {
            context,
            method: request.method,
            url: request.url,
          },
          source: "web.handle-response",
        }),
      ),
    );
  }

  return ResultAsync.fromPromise(res.json(), (cause) =>
    newFetchError({
      cause,
      details: { action: "DeserializeExternalApiResponseBody" },
      kind: "Serialization",
      request,
    }),
  );
}
