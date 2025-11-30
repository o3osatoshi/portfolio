import {
  type ClientOptions,
  createEdgeRpcClient,
  createRpcClient,
} from "@repo/interface/rpc-client";

import { env } from "@/env/client";

type NextFetchOptions = {
  init?: {
    cache?: "force-cache" | "no-store";
    next?: {
      revalidate?: 0 | false | number;
      tags?: string[];
    };
  } & RequestInit;
} & Omit<ClientOptions, "init">;

/**
 * Create a typed RPC client for the interface HTTP API (Node runtime).
 *
 * The client:
 * - targets `env.NEXT_PUBLIC_API_BASE_URL`
 * - accepts Hono client options compatible with Next.js `fetch`
 *   (headers, fetch, and an `init` that supports `cache` / `next`).
 *
 * To forward the current request cookies from a server environment, combine
 * this with `createHeaders` from `@/utils/rpc-headers` when issuing a request.
 */
export function createClient(
  options?: NextFetchOptions,
): ReturnType<typeof createRpcClient> {
  const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
  return createRpcClient(baseURL, options);
}

/**
 * Create a typed RPC client for the Edge HTTP API.
 *
 * The client:
 * - targets `env.NEXT_PUBLIC_API_BASE_URL`
 * - accepts Hono client options compatible with Next.js `fetch`
 *   (headers, fetch, and an `init` that supports `cache` / `next`).
 *
 * To forward the current request cookies from a server environment, combine
 * this with `createHeaders` from `@/utils/rpc-headers` when issuing a request.
 */
export function createEdgeClient(
  options?: NextFetchOptions,
): ReturnType<typeof createEdgeRpcClient> {
  const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
  return createEdgeRpcClient(baseURL, options);
}
