import type { ClientOptions } from "@repo/interface/rpc-client";
import { ResultAsync } from "neverthrow";
import { cookies } from "next/headers";

import { newRichError } from "@o3osatoshi/toolkit";

/**
 * Create a lazily-evaluated `Cookie` header from the current request cookies.
 *
 * This helper is intended for Next.js server environments. It reads cookies
 * via `next/headers#cookies` and wraps them into a `headers` callback
 * compatible with {@link ClientOptions}.
 *
 * On success, the returned {@link ResultAsync} resolves to an object whose
 * `headers` function sets the `Cookie` header. On failure, it yields an
 * {@link Error} created by {@link newRichError} with Infra/Unknown metadata.
 */
export function createHeaders(): ResultAsync<
  Pick<ClientOptions, "headers">,
  Error
> {
  return ResultAsync.fromPromise(cookies(), (cause) =>
    newRichError({
      cause,
      details: { action: "Call cookies" },
      kind: "Unknown",
      layer: "Infra",
    }),
  ).map((reqCookies) => ({
    headers: () => ({
      Cookie: reqCookies.toString(),
    }),
  }));
}
