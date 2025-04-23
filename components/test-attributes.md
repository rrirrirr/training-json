# Data Attributes for Testing Plan Edit Mode

## Plan Items in Sidebar

In `components/plan-switcher.tsx`:
```tsx
<div className={wrapperClassName} data-testid="plan-item" data-plan-id={plan.id}>
```

## Plan Mode Indicator

In `components/plan-mode-indicator.tsx`:
```tsx
// Add to the return statement div
<div className={cn(
  "px-4 py-2 border-b-2 text-sm flex items-center justify-center",
  currentStyle.bg,
  modeData.mode === "normal" ? "!border-gray-500" : "!border-blue-500"
)}
data-testid="edit-mode-indicator"
>
```

## Unsaved Changes Indicator

This needs to be added where the unsaved changes indicator is shown. We need to find where this is displayed.

## Plan Name Input

In the component that handles plan editing:
```tsx
<input
  value={planName}
  onChange={handlePlanNameChange}
  className="..."
  data-testid="plan-name-input"
/>
```

## Action Buttons

In the plan-mode-menu.tsx:
```tsx
// Save button
<Button
  variant="default"
  size="sm"
  onClick={handleSave}
  disabled={isSaving}
  className={cn(...)}
  data-testid="save-button"
>
  ...
</Button>

// Discard button
<Button
  variant="link"
  size="sm"
  onClick={handleBackClick}
  className={cn(...)}
  data-testid="discard-button"
>
  ...
</Button>

// In the AlertDialog
<AlertDialogAction
  onClick={confirmDiscardChanges}
  className="..."
  data-testid="confirm-discard-button"
>
  Discard changes
</AlertDialogAction>

<AlertDialogCancel
  className="..."
  data-testid="cancel-button"
>
  Cancel
</AlertDialogCancel>
```

## Warning Dialog

In the AlertDialogContent:
```tsx
<AlertDialogContent 
  className={...} 
  data-testid="discard-warning-dialog"
>
```

## Plan Name Display

In the component that displays the plan name in view mode:
```tsx
<h1 className="..." data-testid="plan-name">
  {planName}
</h1>
```

## Saved Notification

For the toast/notification when a plan is saved:
```tsx
<div data-testid="saved-notification">
  Plan saved successfully!
</div>
```

## App Loaded Indicator

This should be added to the main app component or layout to indicate when the app is fully loaded:
```tsx
<div data-testid="app-loaded">
  {/* App content */}
</div>
```

## Edit Button

For the button that enters edit mode:
```tsx
<Button
  variant="..."
  size="..."
  onClick={enterEditMode}
  data-testid="edit-button"
>
  Edit
</Button>
```
