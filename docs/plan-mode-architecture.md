# Plan Mode Architecture

This document explains the architecture of the plan management system in the T-JSON application, focusing on how the plan store, edit mode, and view mode work together.

## Core Components

### 1. Plan Store (Zustand)

The Plan Store is the central state management system implemented using Zustand. It handles:

- **State Management**: Storing the active plan, selected views, and plan metadata list
- **Data Persistence**: Saving plans to Supabase and local storage
- **Navigation**: Managing selections for weeks and months/blocks

Key actions in the Plan Store:
- `loadPlanAndSetMode`: Loads a plan and sets the appropriate mode
- `startNewPlanEdit`: Starts editing a new plan
- `_setActivePlanInternal`: Sets the currently active plan and updates metadata
- `removeLocalPlan`: Removes a plan from local storage only
- `saveDraftOrViewedPlan`: Saves the current draft plan
- `selectWeek`, `selectMonth`, `setViewMode`: Navigation actions

### 2. Mode Management in the Store

The store handles the following modes:

- **Normal Mode**: Default mode using the active plan from the store
- **Edit Mode**: For making changes to a plan before saving
- **View Mode**: For viewing external/shared plans before saving to user's plans

Key state and actions:
- `mode`: Current mode ("normal", "edit", or "view")
- `draftPlan`: The plan data being edited or viewed
- `originalPlanId`: Reference to the original plan ID (if applicable)
- `hasUnsavedChanges`: Tracks whether there are unsaved changes
- `_setModeState`: Internal helper to update mode-related state
- `updateDraftPlan`: Updates the draft plan with new data
- `exitMode`: Returns to normal mode
- `discardDraftPlan`: Discards changes and exits mode

## Data Flow

### Normal Mode

1. Plan is loaded from Supabase via `fetchPlanById`
2. `_setActivePlanInternal` is called with the plan data
3. UI components read from `activePlan` in the store

### Edit Mode Flow

1. JSON is imported or a plan is selected for editing
2. `loadPlanAndSetMode` is called with the plan ID and `editIntent = true`
3. UI components check `mode` and use `draftPlan` instead of `activePlan`
4. On save, `saveDraftOrViewedPlan` saves the plan to Supabase
5. After saving, mode is reset to normal and redirects to the saved plan

### View Mode Flow

1. When opening a plan page, the app checks if the plan exists in user's list
2. If plan doesn't exist, `loadPlanAndSetMode` is called with `editIntent = false`
3. UI components check `mode` and use `draftPlan` instead of `activePlan`
4. "Save to My Plans" creates a copy in user's storage

## Session-based Caching

For performance optimization, full plan data is cached in browser memory during a session:

1. When a plan is fetched from the database, it's stored in the session cache
2. Subsequent requests for the same plan use the cached version
3. The cache expires after 30 minutes or when the browser session ends
4. This provides fast access without localStorage size limitations

## UI Components Integration

The following components are plan-mode-aware:

1. **PlanViewer**: 
   - Uses `const planToDisplay = mode !== "normal" ? draftPlan : activePlan`
   - Automatically selects a week/month when entering edit/view mode

2. **AppSidebar**:
   - Shows week/block selectors based on the current mode's plan
   - Gets week types from the appropriate plan

3. **WeekSelector**:
   - Uses plan data from the current mode
   - Renders week buttons with appropriate styles

4. **PlanModeMenu**:
   - Shows different options based on mode
   - Displays plan name and mode indicator
   - Provides actions for saving/exiting

5. **PlanModeIndicator**:
   - Visual indicator of current mode
   - Appears below header when in edit/view mode

## Key Implementation Details

### Plan Selection Logic

The pattern used throughout the app to determine which plan to display:

```javascript
const planToDisplay = mode !== "normal" ? draftPlan : activePlan;
```

### Saving Logic

- **Edit Mode**: Updates or creates a plan in Supabase with the draft data
- **View Mode**: Creates a copy of the viewed plan in user's storage

### SOLID Principles Application

- **Single Responsibility**: Different methods handle different concerns
- **Open/Closed**: Components can work with any plan data source
- **Liskov Substitution**: draftPlan and activePlan are interchangeable
- **Interface Segregation**: Clean boundaries between components
- **Dependency Inversion**: Higher level components depend on abstractions