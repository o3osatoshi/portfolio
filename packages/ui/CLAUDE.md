# CLAUDE.md - UI Package

This file provides guidance for the `@o3osatoshi/ui` package - shared React components and design system.

## Package Overview

The UI package contains reusable React components built with Tailwind CSS and shadcn/ui, providing a consistent design system across the monorepo.

## Package Structure

- **src/components/**: React component library
  - **base/**: Fundamental components (headings, messages)
  - **case/**: Specialized components (form inputs, domain-specific components)  
  - **domain/**: Business domain-specific components
  - **Alert, Avatar, Button, etc.**: shadcn/ui based components
- **src/hooks/**: Shared React hooks
  - **use-mobile.ts**: Mobile detection hook
- **src/lib/**: Utility functions
  - **utils.ts**: Tailwind CSS class utilities
- **src/styles/**: Global CSS styles
  - **globals.css**: Base Tailwind styles and custom CSS

## Design System

### Component Architecture
- **shadcn/ui Foundation**: Built on top of Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Variant System**: Components support multiple visual variants
- **Accessibility**: Built-in accessibility features from Radix UI

### Component Categories
- **Base Components**: Headings, messages, fundamental UI elements
- **Form Components**: Inputs, buttons, form controls with validation
- **Layout Components**: Containers, separators, navigation elements
- **Interactive Components**: Dialogs, dropdowns, tooltips
- **Domain Components**: Business-specific UI components

## Development Commands

**Build the package:**
```bash
pnpm build    # Build with TypeScript compiler
pnpm dev      # Watch mode for development  
```

**Testing:**
```bash
pnpm test     # Run component tests
```

**Linting:**
```bash
pnpm lint     # Run linting with special config (tsconfig.lint.json)
```

**Clean up:**
```bash
pnpm clean    # Remove dist directory
```

## Styling Guidelines

### Tailwind CSS Usage
- Use utility classes for styling components
- Leverage CSS variables for theme customization
- Follow responsive design principles with breakpoint prefixes

### Component Variants
```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-styles",
        destructive: "destructive-styles",
      },
      size: {
        default: "default-size",
        sm: "small-size",
      }
    }
  }
);
```

## Theme System

### Dark Mode Support
- CSS variables for light/dark theme switching
- Uses `next-themes` for theme management
- Consistent color tokens across components

### Customization
- Modify `globals.css` for global style changes
- Use CSS variables defined in `:root` and `[data-theme="dark"]`
- Component variants allow for easy customization

## Integration Guidelines

### Usage in Apps
```typescript
// Import components from the package
import { Button, Card, Input } from "@o3osatoshi/ui";

// Components work with Tailwind CSS classes
<Button variant="default" size="sm" className="custom-class">
  Click me
</Button>
```

### TypeScript Support
- Full TypeScript definitions for all components
- Prop validation and IntelliSense support
- Exported types for component props

## Package Configuration

- **Type**: React component library with ESM exports
- **Dependencies**: React, Radix UI, Tailwind CSS utilities
- **Build System**: TypeScript compilation with proper React JSX
- **PostCSS**: Configured for Tailwind CSS processing

## Important Notes

- **React 18+ Required**: Components use modern React features
- **Tailwind CSS Dependency**: Host applications must have Tailwind CSS configured
- **Theme Consistency**: All components follow the same design tokens
- **Accessibility First**: Built with accessibility best practices