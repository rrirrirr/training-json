# T-JSON Plan Mode Architecture

This document explains the architecture of the plan management system in the T-JSON application, focusing on how the plan store, edit mode, and view mode work together.

## Core Components

### 1. Plan Store (Zustand)

The Plan Store is the central state management system implemented using Zustand. It handles:

- **State Management**: Storing the active plan, selected views, and plan metadata list
- **Data Persistence**: Saving plans to Supabase and local storage
- **Navigation**: Managing selections for weeks and months/blocks

Key actions in the Plan Store:
- `setActivePlan`: Sets the currently active plan and updates metadata
- `createPlan`: Creates a new plan in Supabase
- `updatePlan`: Updates an existing plan in Supabase
- `savePlan`: Saves a plan (helper that uses createPlan)
- `savePlanFromExternal`: Saves a plan from view mode to user's storage
- `selectWeek`, `selectMonth`, `setViewMode`: Navigation actions

### 2. Plan Mode Context (React Context)

The Plan Mode Context handles editing and viewing states, separate from the main store:

- **Edit Mode**: For making changes to a plan before saving
- **View Mode**: For viewing external/shared plans before saving to user's plans
- **Normal Mode**: Default mode using the active plan from the store

Key state and actions:
- `mode`: Current mode ("normal", "edit", or "view")
- `draftPlan`: The plan data being edited or viewed
- `originalPlanId`: Reference to the original plan ID (if applicable)
- `enterEditMode`: Transitions to edit mode with a draft plan
- `enterViewMode`: Transitions to view mode with an external plan
- `saveDraftPlan`: Saves the edited plan to Supabase
- `saveViewedPlanToMyPlans`: Saves a viewed plan to user's plans
- `exitMode`: Returns to normal mode

## Data Flow

### Normal Mode

1. Plan is loaded from Supabase via Plan Store
2. `activePlan` in the store is set
3. UI components read directly from the store

### Edit Mode Flow

1. JSON is imported via upload modal
2. `enterEditMode` is called with the parsed plan data
3. UI components check `mode` and use `draftPlan` instead of `activePlan`
4. On save, `saveDraftPlan` creates a new plan in Supabase
5. After saving, exit edit mode and redirect to the saved plan

### View Mode Flow

1. When opening a plan page, `ViewModeDetector` checks if plan exists in user's list
2. If plan doesn't exist, `enterViewMode` is called
3. UI components check `mode` and use `draftPlan` instead of `activePlan`
4. "Save to My Plans" creates a copy in user's storage

## UI Components Integration

The following components are plan-mode-aware:

1. **PlanViewer**: 
   - Uses `planToDisplay = mode !== "normal" ? draftPlan : activePlan`
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

### Mode Transitions

- **Normal → Edit**: 
  ```javascript
  enterEditMode(planData);
  ```

- **Normal → View**: 
  ```javascript
  enterViewMode(planData, planId);
  ```

- **Edit/View → Normal**:
  ```javascript
  exitMode();
  ```

### Plan Selection Logic

The pattern used throughout the app to determine which plan to display:

```javascript
const planToDisplay = mode !== "normal" ? draftPlan : activePlan;
```

### Saving Logic

- **Edit Mode**: Creates a new plan in Supabase with the draft data
- **View Mode**: Creates a copy of the viewed plan in user's storage

### SOLID Principles Application

- **Single Responsibility**: Plan Store handles persistence, Context handles modes
- **Open/Closed**: Components can work with any plan data source
- **Liskov Substitution**: draftPlan and activePlan are interchangeable
- **Interface Segregation**: Clean boundaries between contexts
- **Dependency Inversion**: Higher level components depend on abstractions
