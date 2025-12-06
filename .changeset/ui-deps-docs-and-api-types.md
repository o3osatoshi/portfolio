---
"@o3osatoshi/ui": patch
---

Tidy up UI docs, stories, and type exports while staying API-compatible.

- Updated Radix UI, Tailwind utilities, Storybook, and related dev dependencies to current minor/patch versions to keep the component library aligned with the workspace toolchain.
- Exported explicit prop types for several components (for example `HeadingProps`, `MessageProps`, `FormInputProps`, `AmountInputProps`, and `SidebarContextProps`) to make reuse in apps and Storybook stories easier without changing any component signatures.
- Tweaked a few Storybook stories to avoid modal backdrops interfering with tests and to use more semantic heading levels, and documented test/coverage commands with a Codecov badge in the README.

