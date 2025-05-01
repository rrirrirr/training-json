# Global Alert System

This document provides an overview of the Global Alert System implemented in the project, explaining how to use it, its features, and implementation details.

## Overview

The Global Alert System provides a centralized way to display alerts and notifications to users. It's built using React Context for state management and is designed to be used throughout the application.

Key features:
- Multiple severity levels (info, warning, error, edit)
- Automatic closing with configurable delay
- Collapsible alerts with stable icon position
- Smooth horizontally-expanding animations
- Consistent styling across the application
- Accessibility support

## Usage

### Basic Usage

```tsx
import { useAlert } from '@/contexts/alert-context';

function YourComponent() {
  const { showAlert, hideAlert } = useAlert();
  
  const handleSuccess = () => {
    showAlert('Operation successful!', 'info', { 
      autoCloseDelay: 3000  // Auto-close after 3 seconds
    });
  };
  
  const handleWarning = () => {
    showAlert('Warning message here', 'warning');
  };
  
  const handleError = () => {
    showAlert('Error message here', 'error');
  };
  
  const enterEditMode = () => {
    showAlert('You are now in edit mode', 'edit', {
      collapsible: true,  // Allow alert to collapse to just an icon
      collapseDelay: 5000 // Collapse after 5 seconds of inactivity
    });
  };
  
  const handleDismiss = () => {
    hideAlert();
  };
  
  // ...
}
```

### API Reference

#### useAlert Hook

The `useAlert` hook provides access to the alert context:

```tsx
const { alertState, showAlert, hideAlert } = useAlert();
```

- **alertState**: The current state of the alert system
  - `id`: Unique identifier for the current alert
  - `message`: Alert message text
  - `severity`: Alert type ('info', 'warning', 'error', 'edit', or null)
  - `isVisible`: Whether the alert is currently visible
  - `autoCloseDelay`: Time in milliseconds before auto-close (or null)
  - `collapsible`: Whether the alert can be collapsed to just an icon
  - `collapseDelay`: Time in milliseconds before collapsing (or null)

- **showAlert(message, severity, options?)**: Display an alert
  - `message`: String content to display
  - `severity`: 'info', 'warning', 'error', or 'edit'
  - `options`: Optional configuration object
    - `autoCloseDelay`: Time in milliseconds before auto-close (null for no auto-close)
    - `collapsible`: Whether the alert can be collapsed to just an icon (default: false)
    - `collapseDelay`: Time in milliseconds before collapsing (default: 3000 if collapsible is true)

- **hideAlert()**: Hide the currently displayed alert

### Alert Severities

The system supports four severity levels, each with appropriate styling:

- **info**: Blue styling, for general information
- **warning**: Yellow styling, for warnings that require attention
- **error**: Red styling, for errors that need to be addressed
- **edit**: Green styling, specifically for edit mode notifications

### Example Component

An example component is provided at `examples/alert-usage-example.tsx` to demonstrate usage.

## Implementation Details

The Global Alert System consists of two main parts:

1. **Alert Context** (`contexts/alert-context.tsx`)
   - Provides state management for alerts
   - Manages alert visibility, content, and timers
   - Exposes the useAlert hook for components

2. **GlobalAlert Component** (`components/layout/GlobalAlert.tsx`)
   - Renders the alert UI based on the context state
   - Handles animations, styling, and user interactions
   - Implements stable-icon collapsing/expanding behavior

The alert context is integrated at the app layout level, making it available throughout the application.

## Stable-Icon Collapsible Feature

The alert system includes an enhanced collapsible feature where the alert's icon stays fixed in position while the alert expands and collapses horizontally. This creates a much smoother and more professional animation effect.

### How It Works

1. **Initial State**: When an alert is shown with `collapsible: true`, it displays the full message with an icon on the left.
2. **Fixed-Position Icon**: The icon is absolutely positioned on the left side of the alert.
3. **Horizontal Collapse**: After the specified `collapseDelay` (default: 3000ms), the alert collapses horizontally to just show the icon, which remains in the same position.
4. **Hover Expansion**: Hovering over a collapsed alert expands it horizontally to the right, keeping the icon in the same position.
5. **Smooth Animation**: All transitions are smooth with the icon serving as a stable anchor point.

### Animation Details

- **Stable Icon Position**: The icon never moves during transitions, creating a smooth experience
- **Left-to-Right Expansion**: Alert expands and collapses horizontally from left to right
- **Fixed Left Padding**: When expanded, the alert maintains padding to accommodate the icon
- **Targeted Transitions**: Only specific properties are animated to maintain performance
- **Smart Content Visibility**: Content fades in/out for smoother transitions

### When to Use Collapsible Alerts

Collapsible alerts are particularly useful for:

- **Edit Mode Indicators**: Alerts that indicate the user is in a special mode and should remain visible but not take up too much space.
- **Background Processes**: Notifications about ongoing processes that the user should be aware of but might not need to focus on.
- **Persistent Information**: Any alert that needs to stay visible for an extended period without being intrusive.

### Example Usage

```tsx
// Show a collapsible edit mode alert with stable icon
showAlert(
  "You are in edit mode - unsaved changes will be lost if you navigate away", 
  "edit", 
  { 
    collapsible: true,    // Enable collapsible behavior
    collapseDelay: 5000   // Collapse after 5 seconds of inactivity
  }
);
```

## Technical Implementation

The stable icon positioning is achieved through:

1. **Absolute Positioning**:
   ```css
   /* Icon container */
   .icon-container {
     position: absolute;
     left: 0;
     top: 0;
     width: 40px;
     height: 40px;
     display: flex;
     align-items: center;
     justify-content: center;
   }
   ```

2. **Fixed Padding for Content**:
   ```css
   /* Alert container */
   .alert-container {
     padding-left: 40px; /* Reserve space for the icon */
   }
   ```

3. **Horizontal Expansion**:
   ```css
   /* Animation origin */
   .alert-container {
     transition: all 300ms ease-in-out;
     transform-origin: left;
   }
   ```

4. **Targeted Transitions**:
   ```css
   /* Disable transitions on the icon */
   .icon {
     transition: none;
   }
   
   /* Content transitions */
   .content {
     transition: opacity 200ms ease-in-out;
   }
   ```

## CSS Variables

The alert system uses CSS variables for styling, particularly for the edit mode alert:

```css
/* Light mode */
--edit-mode-bg: 120 40% 97%;
--edit-mode-border: 120 30% 80%;
--edit-mode-text: 120 50% 40%;

/* Dark mode */
--edit-mode-bg: oklch(0.22 0.06 120);
--edit-mode-border: oklch(0.4 0.15 120);
--edit-mode-text: oklch(0.7 0.2 120);
```

These variables are defined in `app/globals.css` and used by the GlobalAlert component.

## Testing

The alert system includes comprehensive testing:

- Unit tests for the alert context and GlobalAlert component
- Integration tests for the complete alert system
- E2E tests using Playwright

See `tests/README-alert-system.md` for more information about testing.

## Demo Pages

- `app/alert-test/page.tsx`: Basic alert system demonstration
- `app/alert-test-collapsible/page.tsx`: Demonstrates the stable-icon collapsible feature

## Customization

The GlobalAlert component accepts a custom icon property for further customization:

- `icon`: Optional custom icon override (React node)

## Accessibility

The alert component includes appropriate ARIA attributes:
- `role="alert"` for screen reader announcement
- `aria-live="polite"` for non-intrusive announcements
- `aria-hidden` attribute for hiding from screen readers when not visible