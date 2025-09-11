import type { Metadata } from "next";

export const metadata: Metadata = {
  description:
    "Full-stack engineer specializing in Next.js, TypeScript, and Web3/DeFi. Focused on type safety, testing, and CI/CD.",
  title: "About — Satoshi Ogura",
};

export default async function Page() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      <header>
        <h1 className="text-3xl font-bold">About</h1>
        <p className="mt-2 text-neutral-600">
          Full-stack engineer. I work across Web3 (DeFi, Solidity, wagmi/viem)
          and Web2 (CRM, Firebase, Express). I care about type safety, tests,
          CI/CD, and clean UX. Recently supported an EVM-based DeFi protocol
          frontend from zero to $40M+ TVL.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Skills</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Frontend:</strong> TypeScript, React, Next.js, Tailwind CSS
          </li>
          <li>
            <strong>Web3:</strong> Solidity, wagmi, viem, The Graph
          </li>
          <li>
            <strong>Backend/Infra:</strong> Node.js, Express, Prisma,
            PostgreSQL, Firebase, AWS, Docker, Vercel
          </li>
          <li>
            <strong>Quality/Tooling:</strong> Zod, Neverthrow, Jest/Playwright,
            Sentry, Turborepo, GitHub Actions, Figma
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Experience (Highlights)</h2>
        <ul className="space-y-4">
          <li>
            <strong>Napier Labs — Frontend Engineer (2024-08 → 2025-04)</strong>
            <div className="text-neutral-600">
              Built V2 web frontend for an EVM DeFi protocol, largely solo.
              Tech: TypeScript, Next.js, Tailwind, wagmi, viem, GraphQL, Zod,
              Neverthrow, Vercel, Sentry.
            </div>
          </li>
          <li>
            <strong>
              Salon Brain Inc. — Full-stack Engineer (2023-03 → 2024-07)
            </strong>
            <div className="text-neutral-600">
              Built a CRM 0→1 across frontend/backend. Tech: TypeScript,
              Next.js, Tailwind, Express, Firebase.
            </div>
          </li>
          <li>
            <strong>
              SoftBank Corp. — Tech Researcher (2021-04 → 2023-10)
            </strong>
            <div className="text-neutral-600">
              Researched corporate Web3 strategy (Uniswap, AA, contract
              wallets), delivered POCs and internal reports.
            </div>
          </li>
          <li>
            <strong>SoftBank Corp. — Technical PM (2017-06 → 2022-03)</strong>
            <div className="text-neutral-600">
              Gateway design bridging consortium chain and legacy payments.
            </div>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Education</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>The University of Tokyo, Graduate School of Frontier Sciences</li>
          <li>Rikkyo University, Faculty of Science (GPA 3.72)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Links</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            GitHub:{" "}
            <a
              className="underline"
              href="https://github.com/o3osatoshi"
              target="_blank"
              rel="noreferrer"
            >
              @o3osatoshi
            </a>
          </li>
          <li>
            Blog:{" "}
            <a
              className="underline"
              href="https://o3osatoshi.github.io"
              target="_blank"
              rel="noreferrer"
            >
              o3osatoshi.github.io
            </a>
          </li>
          <li>
            LinkedIn:{" "}
            <a
              className="underline"
              href="https://www.linkedin.com/in/satoshi-ogura-189479135/"
              target="_blank"
              rel="noreferrer"
            >
              Satoshi Ogura
            </a>
          </li>
          <li>
            X (Twitter):{" "}
            <a
              className="underline"
              href="https://x.com/o3osatoshi"
              target="_blank"
              rel="noreferrer"
            >
              @o3osatoshi
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
