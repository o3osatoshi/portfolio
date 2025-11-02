import { hc } from "hono/client";

import type { AppType } from "../http/core/app";

/**
 * Create a typed RPC client for the interface HTTP API.
 *
 * The returned client matches the server routes defined by {@link AppType}
 * (e.g. `client.api.healthz.$get()`).
 *
 * @param baseURL Base URL of the deployed interface API.
 * @returns Hono RPC client bound to {@link AppType}.
 */
export function createInterfaceClient(baseURL: string) {
  return hc<AppType>(baseURL);
}
