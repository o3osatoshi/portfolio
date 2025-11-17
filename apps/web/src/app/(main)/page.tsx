import type { Metadata } from "next";
import Link from "next/link";

import { getPath } from "@/utils/nav-handler";

export const metadata: Metadata = {
  description:
    "Portfolio site for technical learning and knowledge sharing. Featuring portfolio content and experimental labs.",
  title: "Satoshi Ogura",
};

export default function Page() {
  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-bold text-3xl">Welcome to o3osatoshi portfolio</h1>
        <p className="mt-2 text-neutral-600">
          This is my portfolio site where I share technical learning and
          experiments. A place to output daily technical insights and contribute
          to the tech community through new technology validation, experimental
          feature implementation, and knowledge sharing.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="font-semibold text-xl">Site Structure</h2>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Portfolio</h3>
            <p className="mb-3 text-neutral-600">
              Information about the site author and creator
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-neutral-600 text-sm">
              <li>Personal introduction and skill set</li>
              <li>Technical blog articles</li>
              <li>Project history and experience</li>
            </ul>
            <Link
              href={getPath("portfolio-about")}
              className="inline-block rounded border px-4 py-2 underline"
            >
              View Portfolio
            </Link>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">Labs</h3>
            <p className="mb-3 text-neutral-600">
              Technical validation and experimental features
            </p>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-neutral-600 text-sm">
              <li>Server-side CRUD operations</li>
              <li>Web3 and blockchain integration</li>
              <li>Latest technology validation and implementation</li>
            </ul>
            <Link
              href={getPath("labs-server-crud")}
              className="inline-block rounded border px-4 py-2 underline"
            >
              Explore Labs
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">Source Code</h2>
        <p className="text-neutral-600">
          The source code for this portfolio site is publicly available on
          GitHub.
        </p>
        <Link
          href="https://github.com/o3osatoshi/portfolio"
          className="inline-block rounded border px-4 py-2 underline"
          rel="noreferrer"
          target="_blank"
        >
          View on GitHub
        </Link>
      </section>
    </div>
  );
}
