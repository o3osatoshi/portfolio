import type { CacheStore } from "@repo/domain";
import { okAsync, Result } from "neverthrow";
import type { z } from "zod";

import type {
  SmartFetch,
  SmartFetchRequest,
  SmartFetchResponse,
} from "./types";

export type SmartFetchCacheOptions<T = unknown> = {
  deserialize?: (data: unknown) => null | T;
  getKey?: (request: SmartFetchRequest) => string | undefined;
  serialize?: (data: T) => unknown;
  shouldCache?: (response: SmartFetchResponse<T>) => boolean;
  store?: CacheStore | undefined;
  ttlMs?: number;
};

export function withCache(
  next: SmartFetch,
  defaults: SmartFetchCacheOptions = {},
): SmartFetch {
  return <S extends z.ZodType>(request: SmartFetchRequest<S>) => {
    type T = z.infer<S>;

    // Skip cache when explicitly disabled
    if ("cache" in request && request.cache === undefined) {
      return next(request);
    }

    const cacheOptions = request.cache;
    const store = cacheOptions?.store ?? defaults.store;
    const getKey = cacheOptions?.getKey ?? defaults.getKey;
    const ttlMs = cacheOptions?.ttlMs ?? defaults.ttlMs;
    if (!store || !getKey) {
      return next(request);
    }

    const serialize =
      cacheOptions?.serialize ?? defaults.serialize ?? ((data: T) => data);
    const deserialize =
      cacheOptions?.deserialize ??
      defaults.deserialize ??
      ((data: unknown) => data as T);
    const shouldCacheFunc = cacheOptions?.shouldCache ?? defaults.shouldCache;
    const shouldCache = (response: SmartFetchResponse<T>) => {
      if (shouldCacheFunc) {
        return shouldCacheFunc(response);
      }
      return response.response.ok;
    };

    const cacheKey = getKey(request);
    if (!cacheKey) {
      return next(request);
    }

    return store
      .get<unknown>(cacheKey)
      .orElse(() => okAsync(null))
      .andThen((cached) => {
        const cachedValue =
          cached == null ? null : safeDeserialize(deserialize, cached);
        if (cachedValue !== null) {
          return okAsync({
            cache: { hit: true, key: cacheKey },
            data: cachedValue as T,
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
          const updatedCache = { hit: false, key: cacheKey };

          if (!shouldCache(res)) {
            return okAsync({ ...res, cache: updatedCache });
          }

          return store
            .set(cacheKey, serialize(res.data), { ttlMs })
            .orElse(() => okAsync(null))
            .map(() => ({ ...res, cache: updatedCache }));
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
