import {
  type ClientOptions,
  createEdgeRpcClient,
  createRpcClient,
} from "@repo/interface/rpc-client";
import { cookies } from "next/headers";

import { env } from "@/env/client";

/**
 * Create a typed RPC client for the Node HTTP API (`/api/*`) that:
 * - targets `env.NEXT_PUBLIC_API_BASE_URL`
 * - forwards the current request cookies as a `Cookie` header
 */
export async function createClient(
  options?: ClientOptions,
): Promise<ReturnType<typeof createRpcClient>> {
  const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
  const headersOption = await createHeadersOption();
  const baseOptions: ClientOptions = {
    ...headersOption,
    ...options,
  };
  return createRpcClient(baseURL, baseOptions);
}

/**
 * Create a typed RPC client for the Edge HTTP API (`/edge/*`) that:
 * - targets `env.NEXT_PUBLIC_API_BASE_URL`
 * - forwards the current request cookies as a `Cookie` header
 */
export async function createEdgeClient(
  options?: ClientOptions,
): Promise<ReturnType<typeof createEdgeRpcClient>> {
  const baseURL = env.NEXT_PUBLIC_API_BASE_URL;
  const headersOption = await createHeadersOption();
  const baseOptions: ClientOptions = {
    ...headersOption,
    ...options,
  };
  return createEdgeRpcClient(baseURL, baseOptions);
}

async function createHeadersOption(): Promise<Pick<ClientOptions, "headers">> {
  const reqCookies = await cookies();
  return {
    headers: () => ({
      Cookie: reqCookies.toString(),
    }),
  };
}
