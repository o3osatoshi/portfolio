import { hc } from "hono/client";
import type { ClientRequestOptions } from "hono/client";

import type { EdgeAppType } from "../http/edge/app";
import type { AppType } from "../http/node/app";

/**
 * Options forwarded to the underlying Hono RPC client.
 *
 * Useful for injecting a custom `fetch` implementation, default headers
 * (e.g. auth cookies), or `RequestInit` overrides.
 */
export type ClientOptions = ClientRequestOptions;

/**
 * Create a typed RPC client for the Edge HTTP API.
 *
 * Routes are mounted under `/edge`.
 *
 * @param baseURL Base URL of the deployed Edge API.
 * @param options Optional Hono client options (headers, fetch, init).
 * @returns Hono RPC client bound to {@link EdgeAppType}.
 */
export function createEdgeRpcClient(baseURL: string, options?: ClientOptions) {
  return hc<EdgeAppType>(baseURL, options);
}

/**
 * Create a typed RPC client for the interface HTTP API.
 *
 * The returned client matches the server routes defined by {@link AppType}
 * (e.g. `client.api.public.healthz.$get()`).
 *
 * @param baseURL Base URL of the deployed interface API.
 * @param options Optional Hono client options (headers, fetch, init).
 * @returns Hono RPC client bound to {@link AppType}.
 */
export function createRpcClient(baseURL: string, options?: ClientOptions) {
  return hc<AppType>(baseURL, options);
}
