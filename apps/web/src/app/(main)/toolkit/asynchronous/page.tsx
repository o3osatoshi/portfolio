import type { Metadata } from "next";
import Link from "next/link";

import SleepDemoCard from "@/app/(main)/toolkit/asynchronous/_components/sleep-demo";
import { getPath } from "@/utils/nav-handler";

export const metadata: Metadata = {
  description:
    "Demonstration of the cancellable sleep helper from @o3osatoshi/toolkit.",
  title: "Toolkit · Asynchronous utilities",
};

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-semibold text-3xl">Asynchronous utilities</h1>
        <p className="text-neutral-600">
          Explore helpers for cancellable timers and infrastructure-friendly
          error handling. The example below shows how `sleep` produces an
          Infra-layer error when aborted.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">Cancellable sleep</h2>
        <p className="text-neutral-600">
          Start the demo to run a three-second delay. Abort the operation to see
          the helper reject with an `InfraCanceledError` that preserves the
          abort reason.
        </p>
        <SleepDemoCard />
      </section>

      <footer className="text-neutral-600 text-sm">
        <Link href={getPath("toolkit")} className="underline">
          Back to Toolkit index
        </Link>
      </footer>
    </div>
  );
}
