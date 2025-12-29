import type { ResultAsync } from "neverthrow";

/**
 * Options for writing to a cache store.
 */
export type CacheSetOptions = {
  /** Set only if the key does not already exist (NX). */
  onlyIfAbsent?: boolean;
  /** Set only if the key already exists (XX). */
  onlyIfPresent?: boolean;
  /** Time to live in milliseconds. */
  ttlMs?: number;
};

/**
 * Port describing a cache store used by application use cases.
 */
export interface CacheStore {
  /** Retrieve a cached value or null when missing. */
  get<T>(key: string): ResultAsync<null | T, Error>;
  /** Store a value with optional conditional and TTL settings. */
  set<T>(
    key: string,
    value: T,
    options?: CacheSetOptions,
  ): ResultAsync<"OK" | null | T, Error>;
}
