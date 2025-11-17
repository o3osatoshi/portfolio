import {
  type ClientOptions,
  createEdgeRpcClient,
  createRpcClient,
} from "@repo/interface/rpc-client";
import { cookies } from "next/headers";

import { env } from "@/env/client";

type NextFetchOptions = {
  init?: {
    cache?: "force-cache" | "no-store";
    next?: {
      revalidate?: 0 | false | number;
      tags?: string[];
    };
  } & Pick<ClientOptions, "init">;
} & Omit<ClientOptions, "init">;

/**
 * Create a typed RPC client for the Node HTTP API (`/api/*`) that:
 * - targets `env.NEXT_PUBLIC_API_BASE_URL`
 * - forwards the current request cookies as a `Cookie` header
 */
export function createClient(
  options?: NextFetchOptions,
): ReturnType<typeof createRpcClient> {
  const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
  return createRpcClient(baseURL, options);
}

/**
 * Create a typed RPC client for the Edge HTTP API (`/edge/*`) that:
 * - targets `env.NEXT_PUBLIC_API_BASE_URL`
 * - forwards the current request cookies as a `Cookie` header
 */
export function createEdgeClient(
  options?: NextFetchOptions,
): ReturnType<typeof createEdgeRpcClient> {
  const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
  return createEdgeRpcClient(baseURL, options);
}

export async function createHeadersOption(): Promise<
  Pick<ClientOptions, "headers">
> {
  const reqCookies = await cookies();
  return {
    headers: () => ({
      Cookie: reqCookies.toString(),
    }),
  };
}
