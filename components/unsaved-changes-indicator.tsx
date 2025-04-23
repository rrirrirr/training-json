"use client"

import { usePlanMode } from "@/contexts/plan-mode-context"

export function UnsavedChangesIndicator() {
  const { hasUnsavedChanges } = usePlanMode()

  if (!hasUnsavedChanges) {
    return null
  }

  return (
    <span 
      className="text-red-500 font-bold ml-1" 
      data-testid="unsaved-changes-indicator"
    >
      *
    </span>
  )
}
