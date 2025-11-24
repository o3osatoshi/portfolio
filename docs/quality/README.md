# Quality & Testing

This repository tracks tests and coverage per package/app via Vitest and Codecov. CI (`.github/workflows/ci.yml`) runs `pnpm check:test:cvrg` on every push/PR and uploads JUnit + coverage reports to Codecov.

## Workspace commands

- `pnpm check:test` – run all package tests.
- `pnpm check:test:cvrg` – run all tests with coverage.
- `pnpm -C packages/<name> test` / `pnpm -C packages/<name> test:cvrg` – run tests for a single package.

## Overall status

[![Coverage](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg)](https://app.codecov.io/github/o3osatoshi/portfolio)

- Detailed view: https://app.codecov.io/github/o3osatoshi/portfolio
- Use the **Tests**, **Flags**, and **Components** tabs in Codecov for deeper breakdowns (test counts, trends, and per-package coverage).

## Coverage graphs (Codecov SVG)

Overall repository coverage can also be visualized via Codecov’s SVG graphs:

![Coverage tree](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graphs/tree.svg)

## Package coverage (Codecov components)

Coverage is segmented per package using Codecov components defined in `codecov.yml`. Badges below reflect coverage for `main` by component.

| Package               | Component id  | Coverage badge                                                                                                                                                                           | Notes                                     |
|-----------------------|---------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------|
| `@repo/domain`        | `domain`      | [![domain](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=domain)](https://app.codecov.io/github/o3osatoshi/portfolio?component=domain)                | Domain entities, value objects, ports.    |
| `@repo/application`   | `application` | [![application](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=application)](https://app.codecov.io/github/o3osatoshi/portfolio?component=application) | Application use cases & DTO validation.   |
| `@repo/interface`     | `interface`   | [![interface](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=interface)](https://app.codecov.io/github/o3osatoshi/portfolio?component=interface)       | HTTP interface (Hono apps, RPC client).   |
| `@repo/prisma`        | `prisma`      | [![prisma](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=prisma)](https://app.codecov.io/github/o3osatoshi/portfolio?component=prisma)                | Prisma client utilities and adapters.     |
| `@repo/auth`          | `auth`        | [![auth](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=auth)](https://app.codecov.io/github/o3osatoshi/portfolio?component=auth)                      | Auth.js/Hono authentication helpers.      |
| `@o3osatoshi/toolkit` | `toolkit`     | [![toolkit](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=toolkit)](https://app.codecov.io/github/o3osatoshi/portfolio?component=toolkit)             | Error shaping and Zod helpers.            |
| `@o3osatoshi/ui`      | `ui`          | [![ui](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=ui)](https://app.codecov.io/github/o3osatoshi/portfolio?component=ui)                            | Shared React UI component library.        |
| `@o3osatoshi/config`  | `config`      | [![config](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=config)](https://app.codecov.io/github/o3osatoshi/portfolio?component=config)                | Shared tsconfig/tsup/ESLint/Biome config. |
| `@repo/eth`           | `eth`         | [![eth](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=eth)](https://app.codecov.io/github/o3osatoshi/portfolio?component=eth)                         | Generated contract types/hooks.           |
| `packages/supabase`   | –             | –                                                                                                                                                                                        | Supabase CLI config only; no tests.       |

## App coverage (Codecov components)

| App              | Component id | Coverage badge                                                                                                                                                                     | Notes                           |
|------------------|--------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------|
| `apps/web`       | `web`        | [![web](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=web)](https://app.codecov.io/github/o3osatoshi/portfolio?component=web)                   | Next.js portfolio app.          |
| `apps/storybook` | `storybook`  | [![storybook](https://codecov.io/gh/o3osatoshi/portfolio/branch/main/graph/badge.svg?component=storybook)](https://app.codecov.io/github/o3osatoshi/portfolio?component=storybook) | Storybook for `@o3osatoshi/ui`. |

## Flags

Coverage uploads are also flagged per package/app (see `flags` and `flag_management` in `codecov.yml`). Use the **Flags** tab in Codecov to view coverage and trends by flag (e.g., `domain`, `application`, `ui`, `web`, `storybook`).
