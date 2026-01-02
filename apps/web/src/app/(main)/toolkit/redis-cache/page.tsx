import type { Metadata } from "next";
import Link from "next/link";

import RedisCacheDemoCard from "@/app/(main)/toolkit/redis-cache/_components/redis-cache-demo";
import { getPath } from "@/utils/nav-handler";

export const metadata: Metadata = {
  description:
    "Demonstration of using the Upstash cache adapter from @repo/integrations to cache a slow API response.",
  title: "Toolkit · Redis cache",
};

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-semibold text-3xl">Redis cache</h1>
        <p className="text-neutral-600">
          This demo calls a deliberately slow API endpoint exposed by the
          interface service at <code>/edge/public/heavy</code> and uses the
          Upstash cache adapter from <code>@repo/integrations</code> to cache
          the response. Requests within the TTL are served from cache; once the
          TTL expires, the next request recomputes the value by hitting the slow
          API again.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">Cached slow endpoint</h2>
        <p className="text-neutral-600">
          Press the button below multiple times. The first request should take
          roughly three seconds as it hits the slow API. Subsequent requests
          within the cache TTL will be significantly faster and marked as
          &quot;Redis cache&quot;; after the TTL expires, the next request will
          become slow again and refresh the cached value.
        </p>
        <RedisCacheDemoCard />
      </section>

      <footer className="text-neutral-600 text-sm">
        <Link href={getPath("toolkit")} className="underline">
          Back to Toolkit index
        </Link>
      </footer>
    </div>
  );
}
