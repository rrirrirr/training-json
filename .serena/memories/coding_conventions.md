# Coding Conventions

## General Style
- TypeScript is used throughout the project
- React functional components with hooks
- Tailwind CSS for styling
- "use client" directive for client components
- Component props are defined using interfaces
- Shadcn UI components are used extensively
- Components often use the cn() utility from lib/utils for className composition
- Lucide React icons are used for UI icons

## File Organization
- Components are organized in their own files
- Related components are grouped into directories
- UI components are in the components/ui directory
- Modal state management uses Zustand stores in components/modals directory

## Naming Conventions
- PascalCase for component names
- camelCase for variables, functions, and methods
- Descriptive names that clearly indicate purpose
- Props interfaces are named with "Props" suffix (e.g., `WelcomeScreenProps`)

## Component Patterns
- Heavy use of Shadcn UI components
- Modals often use a pattern with Zustand stores to manage state
- Responsive design with Tailwind's responsive classes (sm:, md:, lg:)
- Consistent use of className composition with cn() utility
