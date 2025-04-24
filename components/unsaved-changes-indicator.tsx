"use client"

import { usePlanStore } from "@/store/plan-store"

export function UnsavedChangesIndicator() {
  const hasUnsavedChanges = usePlanStore((state) => state.hasUnsavedChanges)

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