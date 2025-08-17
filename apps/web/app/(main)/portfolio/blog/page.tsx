import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Satoshi Ogura",
  description:
    "Latest technical notes and write-ups. Detailed explanations for Labs demos are published on the blog.",
};

export default async function Page() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="text-neutral-600">
        I publish detailed explanations for Labs demos and ongoing research
        notes on my blog.
      </p>
      <div>
        <Link
          href="https://o3osatoshi.github.io"
          className="inline-block rounded border px-4 py-2 underline"
          target="_blank"
        >
          Visit Blog
        </Link>
      </div>
      {/* Optional: fetch and render latest 3–5 posts via RSS on the server */}
    </main>
  );
}
