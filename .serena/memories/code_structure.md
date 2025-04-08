# Code Structure

## Key Directories
- `app/`: Next.js app structure (routes, layouts)
- `components/`: React components
  - `ui/`: Shadcn UI components
  - `modals/`: Modal components using Zustand stores
- `contexts/`: React context providers (notably TrainingPlanContext)
- `hooks/`: Custom React hooks
- `lib/`: Utility functions and libraries
- `public/`: Static assets
- `types/`: TypeScript type definitions
- `utils/`: Helper functions
- `data/`: Data files

## Key Components
- `components/welcome-screen.tsx`: The landing page when no plan is selected
- `components/json-info-modal.tsx`: Contains information about JSON structure and AI assistance
- `components/weekly-view.tsx`: View for displaying weekly plans
- `components/block-view.tsx`: View for displaying monthly blocks

## State Management
- Context API: Used for managing training plan data and UI state
- Zustand: Used for managing modal states (e.g., `useInfoModal`, `useAiInfoModal`)
