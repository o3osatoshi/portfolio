import type { Metadata } from "next";
import Link from "next/link";

import { getPathName } from "@/utils/handle-nav";

export const metadata: Metadata = {
  description:
    "Index of shared toolkit examples for the o3osatoshi portfolio project.",
  title: "Toolkit",
};

export default function Page() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-semibold text-3xl">Toolkit examples</h1>
        <p className="text-neutral-600">
          Shared utilities from <code>@o3osatoshi/toolkit</code> can be explored
          here. Browse the sections below for interactive demos and usage
          patterns.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">Available demos</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-600">
          <li>
            <Link
              href={getPathName("toolkit-asynchronous")}
              className="underline"
            >
              Asynchronous utilities: cancellable sleep helper
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
