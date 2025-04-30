"use client"

// Removed useEffect, useState
import { usePlanStore } from "@/store/plan-store" // Add import

export function AppLoadedMarker() {
  // Get relevant state from the store
  const isLoading = usePlanStore((state) => state.isLoading)
  const error = usePlanStore((state) => state.error)
  // Optional: Check if initial hydration/setup is done if needed
  // const isInitialized = usePlanStore((state) => state.someInitializationFlag);

  // Determine if the app is considered "loaded" (not loading and no critical error, or error is handled)
  // Adjust this condition based on exactly when you want the marker to appear
  const isAppReady = !isLoading // Render as soon as loading completes (success or error)

  if (isAppReady) {
    return (
      <div data-testid="app-loaded" className="sr-only">
        App loaded
      </div>
    )
  }

  // Return null if still loading or not ready
  return null
}
