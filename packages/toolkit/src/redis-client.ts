import { Redis } from "@upstash/redis";
import { Redis as EdgeRedis } from "@upstash/redis/cloudflare";

/**
 * Connection options for constructing Upstash Redis clients.
 *
 * Shared between {@link createRedisClient} (Node.js/Edge) and
 * {@link createEdgeRedisClient} (Cloudflare Workers and other
 * Cloudflare-compatible runtimes).
 *
 * Use this to pass configuration from environment variables or other
 * runtime-specific sources into the client factories.
 *
 * @public
 */
export type RedisClientOptions = {
  /**
   * Upstash REST API token.
   *
   * This value is required by Upstash; if omitted, the underlying client
   * will throw at runtime when used.
   */
  token?: string;
  /**
   * Upstash REST endpoint URL.
   *
   * This value is required by Upstash; if omitted, the underlying client
   * will throw at runtime when used.
   */
  url?: string;
};

/**
 * Create an Upstash Redis client for Cloudflare Workers / Edge runtimes.
 *
 * This helper is a thin wrapper around `new EdgeRedis(...)` from
 * `@upstash/redis/cloudflare` that accepts the connection URL and token
 * via {@link RedisClientOptions}.
 *
 * @param options - Connection settings (URL and token) for the Redis client.
 * @returns A configured Cloudflare-compatible `Redis` client instance.
 *
 * @public
 */
export function createEdgeRedisClient(options?: RedisClientOptions): EdgeRedis {
  return new EdgeRedis({ token: options?.token, url: options?.url });
}

/**
 * Create an Upstash Redis client configured for Node.js / generic Edge runtimes.
 *
 * This helper is a thin wrapper around `new Redis(...)` that accepts the
 * connection URL and token via {@link RedisClientOptions}. Callers are
 * responsible for reading configuration (for example, from environment
 * variables) before invoking this function.
 *
 * @param options - Connection settings (URL and token) for the Redis client.
 * @returns A configured `Redis` client instance.
 *
 * @public
 */
export function createRedisClient(options?: RedisClientOptions): Redis {
  return new Redis({ token: options?.token, url: options?.url });
}
