import type { Result, ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { type HttpErrorOptions, requestHttp } from "./http-request";
import { expectOkHttpResponse, readHttpJson } from "./http-response";

export type HttpJsonParser<T> = (input: unknown) => Result<T, RichError>;

export function readHttpJsonWithParser<T>(
  response: Response,
  options: HttpErrorOptions,
  parser: HttpJsonParser<T>,
): ResultAsync<T, RichError> {
  return readHttpJson(response, options).andThen(parser);
}

export function requestHttpJsonWithParser<T>(
  url: string,
  init: RequestInit | undefined,
  options: {
    parser: HttpJsonParser<T>;
    read: HttpErrorOptions;
    request: HttpErrorOptions;
  },
): ResultAsync<T, RichError> {
  return requestHttp(url, init, options.request)
    .andThen((response) => expectOkHttpResponse(response, options.request))
    .andThen((response) =>
      readHttpJsonWithParser(response, options.read, options.parser),
    );
}
