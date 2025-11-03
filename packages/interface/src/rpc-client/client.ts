import { hc } from "hono/client";

import type { EdgeAppType } from "../http/edge/app";
import type { AppType } from "../http/node/app";

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

/**
 * Create a typed RPC client for the Edge HTTP API.
 *
 * Routes are mounted under `/edge`.
 */
export function createInterfaceClientEdge(baseURL: string) {
  return hc<EdgeAppType>(baseURL);
}
