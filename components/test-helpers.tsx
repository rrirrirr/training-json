/**
 * Helper component to wrap app for testing
 */
import React from 'react'

export function AppLoaded({ children }: { children: React.ReactNode }) {
  return <div data-testid="app-loaded">{children}</div>
}

/**
 * This function adds unsaved changes indicator to be used where needed
 */
export function UnsavedChangesIndicator() {
  return <span data-testid="unsaved-changes-indicator">*</span>
}

/**
 * Add this to the toast/notification when a plan is saved:
 */
export function SavedNotification() {
  return <div data-testid="saved-notification">Plan saved successfully!</div>
}

/**
 * Adds data-testid="plan-name" to plan name in view mode
 */
export function PlanName({ children }: { children: React.ReactNode }) {
  return <span data-testid="plan-name">{children}</span>
}

/**
 * Button with data-testid="edit-button"
 */
export function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button data-testid="edit-button" onClick={onClick}>
      Edit
    </button>
  )
}

/**
 * Input with data-testid="plan-name-input"
 */
export function PlanNameInput({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <input 
      data-testid="plan-name-input" 
      value={value} 
      onChange={onChange} 
    />
  )
}

/**
 * Confirmation button for discard
 */
export function ConfirmDiscardButton({ onClick }: { onClick: () => void }) {
  return (
    <button data-testid="confirm-discard-button" onClick={onClick}>
      Discard changes
    </button>
  )
}
