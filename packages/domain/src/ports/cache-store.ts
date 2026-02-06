import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

/**
 * Options for writing to a cache store.
 */
export type CacheSetOptions = {
  /** Set only if the key does not already exist (NX). */
  onlyIfAbsent?: boolean | undefined;
  /** Set only if the key already exists (XX). */
  onlyIfPresent?: boolean | undefined;
  /** Time to live in milliseconds. */
  ttlMs?: number | undefined;
};

/**
 * Port describing a cache store used by application use cases.
 */
export interface CacheStore {
  /** Retrieve a cached value or null when missing. */
  get<T>(key: string): ResultAsync<null | T, RichError>;
  /** Store a value with optional conditional and TTL settings. */
  set<T>(
    key: string,
    value: T,
    options?: CacheSetOptions,
  ): ResultAsync<"OK" | null | T, RichError>;
}
