# CLAUDE.md - Storybook Application

This file provides guidance for the Storybook application - component library documentation and testing within the monorepo.

## Application Overview

Storybook app provides interactive documentation, development environment, and visual testing for the `@repo/ui` component library and other shared components.

## Application Structure

- **stories/**: Storybook story files
  - **button.stories.ts**: Example button component stories
- **storybook-static/**: Built static Storybook site
- **vite.config.ts**: Vite configuration for Storybook
- **vitest.workspace.ts**: Vitest configuration for component testing

## Development Commands

**Storybook Development:**
```bash
pnpm dev              # Start Storybook development server
pnpm build            # Build static Storybook site
pnpm preview          # Preview built Storybook
```

**Testing:**
```bash
pnpm test             # Run component tests with Vitest
pnpm test:watch       # Watch mode for tests
```

## Story Development

### Story Structure
```typescript
// Example story file
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@repo/ui';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline']
    }
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default'
  }
};
```

### Component Documentation
- **Args Table**: Automatic props documentation
- **Controls**: Interactive component property controls
- **Actions**: Event handler logging and testing
- **Docs**: Auto-generated documentation from JSDoc comments

## UI Component Integration

### @repo/ui Components
- Import components directly from `@repo/ui` package
- Stories automatically reflect component API changes
- Shared styling and theme system integration

### Design System Documentation
- Document component variants and use cases
- Show responsive behavior and accessibility features
- Demonstrate proper usage patterns

## Build Configuration

### Vite Integration
- **Fast Builds**: Uses Vite for fast development and building
- **TypeScript**: Full TypeScript support for stories
- **CSS Processing**: Tailwind CSS and PostCSS integration
- **Module Resolution**: Proper monorepo package resolution

### Storybook Configuration
- **React Integration**: Configured for React component development
- **Addon Ecosystem**: Essential addons for documentation and testing
- **Theme Support**: Dark/light mode testing

## Testing Strategy

### Visual Testing
- **Storybook Stories**: Serve as visual regression tests
- **Component Isolation**: Test components in isolation
- **State Testing**: Test different component states and variants

### Unit Testing with Vitest
- **Component Testing**: Test component behavior and props
- **Interaction Testing**: Test user interactions and events
- **Accessibility Testing**: Ensure components meet accessibility standards

## Deployment

### Static Site Generation
- **Build Output**: Static site in `storybook-static/`
- **Hosting**: Can be deployed to any static hosting service
- **Documentation**: Serves as living component documentation

### Integration with CI/CD
- **Visual Regression**: Can integrate with visual testing services
- **Component Tests**: Run as part of build process
- **Documentation Updates**: Auto-deploy on component changes

## Workspace Integration

### Package Dependencies
- **@repo/ui**: Primary component library being documented
- **Shared Config**: Uses workspace TypeScript and build configuration
- **Theme System**: Integrates with shared theme and styling

### Development Workflow
- **Component Development**: Develop components alongside stories
- **Design Review**: Use Storybook for design and UX review
- **Documentation**: Maintain living component documentation

## Important Notes

- **Component Library Focus**: Primarily documents `@repo/ui` components
- **Design System**: Serves as the source of truth for component usage
- **Testing Environment**: Provides isolated component testing environment
- **Documentation**: Auto-generates documentation from component props and JSDoc