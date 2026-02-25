import type { CacheStore } from "@repo/domain";
import { okAsync, Result } from "neverthrow";
import type { z } from "zod";

import type {
  SmartFetch,
  SmartFetchRequest,
  SmartFetchResponse,
} from "./types";

/**
 * Cache options shared by all cached smart-fetch requests.
 *
 * - `store` must implement `CacheStore`.
 * - `ttlMs` defines default TTL when request-level TTL is absent.
 *
 * @public
 */
export type SmartFetchCacheOptions = {
  store: CacheStore;
  ttlMs?: number;
};

/**
 * Per-request cache options.
 *
 * - `getKey` must return a deterministic cache key or `undefined` to skip cache.
 * - `serialize` / `deserialize` can customize payload transformation.
 * - `shouldCache` decides which successful responses should be stored.
 *
 * @public
 */
export type SmartFetchRequestCacheOptions<S extends z.ZodType> = {
  deserialize?: (data: unknown) => null | z.infer<S>;
  getKey: (request: SmartFetchRequest<S>) => string | undefined;
  serialize?: (data: z.infer<S>) => unknown;
  shouldCache?: (response: SmartFetchResponse<z.infer<S>>) => boolean;
  ttlMs?: number;
};

/**
 * Enable response caching for a smart fetch instance.
 *
 * Cache is only used when `request.cache?.getKey` returns a key.
 * Cache hits return a synthetic 200 response.
 *
 * @param next Underlying smart fetch function.
 * @param options Default cache settings (store/ttl).
 * @returns Cached smart-fetch wrapper.
 * @public
 */
export function withCache(
  next: SmartFetch,
  options: SmartFetchCacheOptions,
): SmartFetch {
  const store = options.store;

  return <S extends z.ZodType>(request: SmartFetchRequest<S>) => {
    const serialize =
      request.cache?.serialize === undefined
        ? (data: z.infer<S>) => data
        : request.cache.serialize;
    const deserialize =
      request.cache?.deserialize === undefined
        ? (data: unknown) => {
            const result = request.decode.schema.safeParse(data);
            return result.success ? result.data : null;
          }
        : request.cache.deserialize;
    const shouldCache =
      request.cache?.shouldCache === undefined
        ? (response: SmartFetchResponse) => response.response.ok
        : request.cache.shouldCache;

    const cacheKey = request.cache?.getKey(request);
    if (!cacheKey) {
      return next(request);
    }

    return store
      .get(cacheKey)
      .orElse(() => okAsync(null))
      .andThen((rawData) => {
        const data = safeDeserialize<z.infer<S>>(deserialize, rawData);
        if (data !== null) {
          return okAsync({
            cache: { hit: true, key: cacheKey },
            data,
            response: {
              headers: new Headers(),
              ok: true,
              status: 200,
              statusText: "OK",
              url: request.url,
            },
          });
        }

        return next(request).andThen((res) => {
          if (!shouldCache(res)) {
            return okAsync({ ...res, cache: { hit: false, key: cacheKey } });
          }

          return store
            .set(cacheKey, serialize(res.data), {
              ttlMs: request.cache?.ttlMs ?? options.ttlMs,
            })
            .orElse(() => okAsync(null))
            .map(() => ({ ...res, cache: { hit: false, key: cacheKey } }));
        });
      });
  };
}

function safeDeserialize<T>(
  deserialize: (data: unknown) => null | T,
  value: unknown,
): null | T {
  return Result.fromThrowable(
    () => deserialize(value),
    () => null,
  )().unwrapOr(null);
}
