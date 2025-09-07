@o3osatoshi/ui

Reusable React UI components built on Tailwind CSS v4 and Radix UI. Each component exposes consistent `data-slot` attributes so you can reliably target and override styles from your app.

**Install**
- Peer requirements: `react`, `react-dom` (18 or newer recommended)
- Recommended: Tailwind CSS v4 + Vite
- Install: `pnpm add @o3osatoshi/ui`

Import the global stylesheet once in your app (e.g., App/Layout entry):

```
import '@o3osatoshi/ui/globals.css'
```

The stylesheet defines tokens via Tailwind v4’s `@theme inline` (e.g., `--background`, `--foreground`). You can override these CSS custom properties to theme the library.

**Usage**
- Preferred: import from the package entry
  - `import { Button, Input } from '@o3osatoshi/ui'`
- Subpath imports (TypeScript sources) are available for workspace/Storybook
  - `import { Button } from '@o3osatoshi/ui/components/button'`
  - `import { cn } from '@o3osatoshi/ui/lib/utils'`

Using the top‑level entry is recommended for stability and tree‑shaking.

**Components**
- Buttons: `Button` (`variant`, `size`, `asChild`)
- Forms: `Input`, `Label`
- Feedback: `Alert`, `Message`
- Overlays: `Dialog` suite, `Sheet` suite
- Navigation: `Sidebar` suite
- Others: `Avatar`, `Breadcrumb`, `DropdownMenu`, `Separator`, `Skeleton`, `Tooltip`, etc.

All components expose `data-slot` attributes to make styling overrides predictable.

**Examples**

Buttons:

```
import { Button } from '@o3osatoshi/ui'

export default function Page() {
  return (
    <div className="p-4">
      <Button variant="default">Save</Button>
      <Button variant="destructive" className="ml-2">Delete</Button>
    </div>
  )
}
```

Dialog (Radix‑based):

```
import { Button, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@o3osatoshi/ui'

export function ExampleDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Title</DialogTitle>
        </DialogHeader>
        Body text
      </DialogContent>
    </Dialog>
  )
}
```

Input + Message:

```
import { Input } from '@o3osatoshi/ui'
import { Message } from '@o3osatoshi/ui/components/base/message'

export function ExampleForm() {
  return (
    <div className="space-y-2">
      <Input placeholder="Email" aria-invalid />
      <Message variant="destructive">Invalid email format</Message>
    </div>
  )
}
```

**Styling**
- Tailwind v4 tokens
  - `globals.css` defines CSS variables such as `--background`, `--primary`, etc.
  - Use `data-slot` selectors (e.g., `[data-slot="dialog-content"]`) to safely target internals.
- Utility
  - `cn(...classes)` is a light wrapper around `clsx` + `tailwind-merge`.

**Notes (current implementation)**
- Client‑only components
  - Files like `Dialog`, `Sheet`, `Sidebar`, `Avatar` include `"use client"`. In Next.js, use them from client components.
- Sidebar state
  - Open/close state is persisted via cookie. Initialize/read as needed in your app.
- Subpaths
  - Subpath imports expose TypeScript sources for workspace DX. Prefer the top‑level entry for application code.

**Exports**
- Package entry (recommended): `@o3osatoshi/ui`
  - ESM: `./dist/entry.js`
  - Types: `./dist/entry.d.ts`
- Subpaths (TS sources):
  - `@o3osatoshi/ui/components/*`
  - `@o3osatoshi/ui/hooks/*`
  - `@o3osatoshi/ui/lib/*`
  - `@o3osatoshi/ui/globals.css`

Prefer the compiled entry; use subpaths mainly for local Storybook/workspace flows.

**Development**
- Typecheck: `pnpm -C packages/ui typecheck`
- Build: `pnpm -C packages/ui build`
- Storybook (workspace): `pnpm -C apps/storybook dev`

**License**
- MIT
