# Centralized Edit Plan Logic

The project now has centralized logic for entering edit mode for a plan, implemented as follows:

## Implementation
1. Added a `startEditingPlan` utility function to the `usePlanStore` in `store/plan-store.ts`
   - This function takes a plan ID and handles all the steps needed to enter edit mode
   - It checks for conflicts with other editing sessions
   - It uses the existing `loadPlanAndSetMode` internally, passing `editIntent=true`
   - It returns a boolean indicating success or failure

2. Updated the `EditButton` component to use this centralized function:
   - It calls `startEditingPlan` first
   - If successful, it navigates to the edit page
   - If unsuccessful, it shows an error toast

3. Fixed the JSON editor integration:
   - Kept the original behavior of "View/Edit JSON" menu item opening the JSON editor
   - Fixed the `handleEditorSave` function in `SidebarDialogs` to reliably navigate to the edit page
   - Added a setTimeout to ensure navigation happens after dialog closing starts

## Edit Flow
Two main paths for editing a plan remain in place:

1. Via standalone Edit Button: 
   - Directly uses `startEditingPlan` utility function
   - Navigates to edit page immediately

2. Via "View/Edit JSON" menu item in plan dropdown:
   - Opens the JSON editor dialog
   - When saving from the dialog, it:
     - Sets edit mode via `_setModeState`
     - Navigates to the edit page after a short delay
   - This path is used by the e2e tests

## Components Using Centralized Logic
- `EditButton` - The standalone edit button component
- `SidebarDialogs` - The component that renders the JSON editor

## Tests
The implementation maintains compatibility with existing e2e tests:
- Tests use the `triggerEditViaJsonMenu` helper that:
  1. Clicks the plan actions trigger
  2. Clicks the "View/Edit JSON" menu item
  3. Clicks the "save-draft" button in the editor
  4. The editor save handler navigates to the edit page

## Benefits
- Consistent conflict checking and state preparation logic in one place
- Improved error handling and user feedback
- Maintains compatibility with existing code patterns and tests
- Makes it easier to add new UI elements that can trigger edit mode