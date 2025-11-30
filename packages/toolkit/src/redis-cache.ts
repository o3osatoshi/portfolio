import type { Redis } from "@upstash/redis";
import { ResultAsync } from "neverthrow";

import { newError } from "./error";

/**
 * Options to control how cache keys are constructed.
 *
 * @public
 */
export type KvOptions = {
  /**
   * Prefix applied to every key to create a logical namespace.
   * The final key becomes `${prefix}:${key}` when a prefix is provided.
   */
  prefix?: string;
};

/**
 * Options for conditional `SET` behavior and expiration.
 *
 * Mirrors the `NX` / `XX` and `PX` flags exposed by Upstash Redis.
 *
 * @public
 */
export type SetOptions = {
  /** Set only if the key does not already exist (NX). */
  onlyIfAbsent?: boolean;
  /** Set only if the key already exists (XX). */
  onlyIfPresent?: boolean;
  /** Time to live in milliseconds (PX). If omitted, the key is persistent. */
  ttlMs?: number;
};

/**
 * Retrieves a value by key from Upstash Redis.
 *
 * If the key does not exist, the result resolves to `null`. If the underlying
 * Redis request fails, the error branch contains an `InfraUnavailableError`
 * created via {@link newError}.
 *
 * @typeParam T - Expected value shape stored at the key.
 * @param redis - Upstash Redis client instance.
 * @param key - Cache key (number or string).
 * @param opt - Key construction options (e.g. `prefix`).
 * @returns A ResultAsync that yields `T | null` on success or a structured error on failure.
 * @public
 */
export function kvGet<T>(
  redis: Redis,
  key: number | string,
  opt: KvOptions = {},
): ResultAsync<null | T, Error> {
  return ResultAsync.fromPromise(
    redis.get<T>(buildKey(key, opt.prefix)),
    (cause) =>
      newError({
        action: "KvGet",
        cause,
        hint: "Verify Redis connectivity or cache configuration.",
        impact: "Cache read failed; the value could not be loaded from Redis.",
        kind: "Unavailable",
        layer: "Infra",
        reason: "Failed to get value from Redis key-value store",
      }),
  );
}

/**
 * Stores a value at `key`, supporting TTL and conditional semantics.
 *
 * The underlying Upstash Redis client is responsible for serialization; this
 * helper simply forwards the value as-is and wraps the operation in a
 * ResultAsync.
 *
 * @typeParam T - Value type to store at the key.
 * @param redis - Upstash Redis client instance.
 * @param key - Cache key (number or string).
 * @param value - Value to store.
 * @param options - Conditional and expiration options (NX/XX, PX).
 * @param opt - Key construction options (e.g. `prefix`).
 * @returns A ResultAsync whose success branch resolves to:
 * - `"OK"` when the underlying Redis `SET` command completes and acknowledges the write.
 * - `null` when a condition such as `NX` / `XX` prevents the value from being written (e.g. key already exists with `NX`).
 * - `T` for alternative client implementations that choose to return the stored value itself instead of `"OK"`; with Upstash Redis, this branch is not used and results are always `"OK"` or `null`.
 * @public
 */
export function kvSet<T>(
  redis: Redis,
  key: number | string,
  value: T,
  { onlyIfAbsent, onlyIfPresent, ttlMs }: SetOptions = {},
  opt: KvOptions = {},
): ResultAsync<"OK" | null | T, Error> {
  const opts: Record<string, unknown> = {
    ...(ttlMs !== undefined ? { px: ttlMs } : {}),
    ...(onlyIfAbsent !== undefined ? { nx: onlyIfAbsent } : {}),
    ...(onlyIfPresent !== undefined ? { xx: onlyIfPresent } : {}),
  };
  return ResultAsync.fromPromise(
    redis.set<T>(buildKey(key, opt.prefix), value, opts),
    (cause) =>
      newError({
        action: "KvSet",
        cause,
        hint: "Verify Redis connectivity or cache configuration.",
        impact:
          "Cache write failed; the underlying operation may still have succeeded without caching.",
        kind: "Unavailable",
        layer: "Infra",
        reason: "Failed to set value in Redis key-value store",
      }),
  );
}

/**
 * Builds a namespaced key using the optional `prefix`.
 *
 * @param key - Base key identifier.
 * @param prefix - Optional namespace prefix.
 * @returns A string key in the form `${prefix}:${key}` when a prefix is provided.
 * @internal
 */
function buildKey(key: number | string, prefix?: string) {
  const k = String(key);
  return prefix ? `${prefix}:${k}` : k;
}
