import type { CacheStore } from "@repo/domain";
import { okAsync } from "neverthrow";

import type {
  BetterFetchClient,
  BetterFetchRequest,
  BetterFetchResponse,
} from "./better-fetch-types";
import { mergeMeta } from "./better-fetch-types";

export type BetterFetchCacheOptions<T> = {
  deserialize?: (data: unknown) => null | T;
  getKey: (request: BetterFetchRequest<T>) => string | undefined;
  serialize?: (data: T) => unknown;
  shouldCache?: (response: BetterFetchResponse<T>) => boolean;
  store?: CacheStore | undefined;
  ttlMs?: number;
};

export function withCache<T>(
  next: BetterFetchClient<T>,
  options: BetterFetchCacheOptions<T>,
): BetterFetchClient<T> {
  const store = options.store;
  if (!store) {
    return next;
  }

  const serialize = options.serialize ?? ((data: T) => data);
  const deserialize = options.deserialize ?? ((data: unknown) => data as T);
  const shouldCache =
    options.shouldCache ?? ((response) => response.response?.ok ?? true);

  return (request) => {
    const cacheKey = options.getKey(request);
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
            data: cachedValue,
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
            .set(cacheKey, serialize(res.data), { ttlMs: options.ttlMs })
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
