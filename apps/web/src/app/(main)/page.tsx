import type { Metadata } from "next";
import Link from "next/link";

import { getPathName } from "@/utils/handle-nav";

export const metadata: Metadata = {
  title: "Satoshi Ogura",
  description:
    "Portfolio site for technical learning and knowledge sharing. Featuring portfolio content and experimental labs.",
};

export default function Page() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Welcome to o3osatoshi portfolio</h1>
        <p className="mt-2 text-neutral-600">
          This is my portfolio site where I share technical learning and
          experiments. A place to output daily technical insights and contribute
          to the tech community through new technology validation, experimental
          feature implementation, and knowledge sharing.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold">Site Structure</h2>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Portfolio</h3>
            <p className="text-neutral-600 mb-3">
              Information about the site author and creator
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
              <li>Personal introduction and skill set</li>
              <li>Technical blog articles</li>
              <li>Project history and experience</li>
            </ul>
            <Link
              href={getPathName("portfolio-about")}
              className="inline-block rounded border px-4 py-2 underline"
            >
              View Portfolio
            </Link>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Labs</h3>
            <p className="text-neutral-600 mb-3">
              Technical validation and experimental features
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-neutral-600 mb-4">
              <li>Server-side CRUD operations</li>
              <li>Web3 and blockchain integration</li>
              <li>Latest technology validation and implementation</li>
            </ul>
            <Link
              href={getPathName("labs-server-crud")}
              className="inline-block rounded border px-4 py-2 underline"
            >
              Explore Labs
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Source Code</h2>
        <p className="text-neutral-600">
          The source code for this portfolio site is publicly available on
          GitHub.
        </p>
        <Link
          href="https://github.com/o3osatoshi/portfolio"
          className="inline-block rounded border px-4 py-2 underline"
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub
        </Link>
      </section>
    </div>
  );
}
