import { Redis } from "@upstash/redis";

/**
 * Options for constructing an Upstash `Redis` client.
 *
 * Use this to pass configuration from environment variables or other
 * runtime-specific sources into {@link createRedisClient}.
 *
 * @public
 */
export type CreateRedisClientOptions = {
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
 * Create an Upstash Redis client configured for Node.js / Edge runtimes.
 *
 * This helper is a thin wrapper around `new Redis(...)` that accepts the
 * connection URL and token via {@link CreateRedisClientOptions}. Callers are
 * responsible for reading configuration (for example, from environment
 * variables) before invoking this function.
 *
 * @param options - Connection settings (URL and token) for the Redis client.
 * @returns A configured `Redis` client instance.
 *
 * @public
 */
export function createRedisClient(
  options: CreateRedisClientOptions = {},
): Redis {
  return new Redis({ token: options.token, url: options.url });
}
