import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  description:
    "Latest technical notes and write-ups. Detailed explanations for Labs demos are published on the blog.",
  title: "Blog — Satoshi Ogura",
};

export default async function Page() {
  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="font-bold text-3xl">Blog</h1>
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
    </div>
  );
}
