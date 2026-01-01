import { okAsync } from "neverthrow";

import type {
  BetterFetchCacheOptions,
  BetterFetchClient,
  BetterFetchRequest,
} from "./better-fetch-types";
import { mergeMeta } from "./better-fetch-types";

export function withCache(
  next: BetterFetchClient,
  defaults: BetterFetchCacheOptions = {},
): BetterFetchClient {
  return <T>(request: BetterFetchRequest<T>) => {
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
    const shouldCache = (response: any) => {
      if (shouldCacheFunc) {
        const result = shouldCacheFunc(response);
        if (result === false || result === undefined) return false;
        return true;
      }
      return response.response?.ok ?? true;
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
            cached: true,
            data: cachedValue as T,
            meta: mergeMeta(
              { attempts: 0, cacheHit: true, cacheKey },
              undefined,
            ),
            response: undefined,
          });
        }

        return next(request).andThen((res) => {
          const meta = mergeMeta(res.meta, {
            cacheHit: false,
            cacheKey,
          });

          if (!shouldCache(res)) {
            return okAsync({ ...res, meta });
          }

          return store
            .set(cacheKey, serialize(res.data), { ttlMs })
            .orElse(() => okAsync(null))
            .map(() => ({ ...res, meta }));
        });
      });
  };
}

function safeDeserialize<T>(
  deserialize: (data: unknown) => null | T,
  value: unknown,
): null | T {
  try {
    return deserialize(value);
  } catch {
    return null;
  }
}
