# Changesets

This repository uses `@changesets/cli` to version the publishable packages in the monorepo. At the moment only `@o3osatoshi/ui` and `@o3osatoshi/toolkit` are released to npm; apps and other workspaces are ignored via `.changeset/config.json`.

## Recommended workflow (Codex + CI)

1. Create or update the changeset entry
   - Preferred: ask Codex to draft/update `.changeset/<slug>.md` summarizing user‑facing changes and correct semver bumps per package.
   - Alternative: run `pnpm release:log` to generate a stub interactively, then ask Codex to refine the body content.
2. Commit and open a PR
   - Commit your code changes together with the new/updated `.changeset/*.md` files.
   - Open a pull request against `main` and wait for CI to pass.
3. Merge and let CI release
   - Merging to `main` triggers `.github/workflows/release-packages.yml`.
   - That workflow installs dependencies, builds the repo, and runs `changesets/action@v1` with `pnpm release:version` and `pnpm release`.
   - If `NODE_AUTH_TOKEN` (or `NPM_TOKEN`) is configured, packages are published automatically.
   - If not, the action opens a release PR that contains version bumps and `CHANGELOG.md` updates; merge that PR when you are ready to ship.
4. (Optional) Review changelogs
   - When a release PR is opened, review the generated `CHANGELOG.md` entries there and follow up with another PR only if wording needs adjustment.

## Manual/local workflow (advanced, rarely needed)

In exceptional cases where you want to run the release locally instead of via CI:

1. Validate and version
   - `pnpm refine`             # format → build → typecheck/test → api:extract
   - `pnpm release:version`    # applies pending changesets and updates package versions/changelogs
   - `git add -A && git commit -m "chore(release): version packages"`
2. Publish and push
   - `pnpm release`            # runs `changeset publish` (requires npm auth)
   - `git push --follow-tags`

## Writing changeset entries

- Use Codex to author the body: clearly summarize user‑visible changes, note breaking changes and migration steps, and set semver per package (`major` | `minor` | `patch`).
- Keep one file per logical change so related updates ship together.
- Always include YAML front matter:
  ```
  ---
  "@o3osatoshi/ui": minor
  "@o3osatoshi/toolkit": patch
  ---
  ```
  - Quote package names and list only packages that publish; private workspaces and ignored entries (`@repo/application`, `@repo/domain`, `@repo/prisma`, `@repo/eth`, `@repo/functions`, `@repo/storybook`, `@repo/web`) are skipped automatically.
- Let `pnpm release:version` delete processed files; do not remove them manually.
