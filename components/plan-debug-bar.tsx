// File: components/plan-debug-bar.tsx
"use client"

import { useState, useEffect } from "react"
import { usePlanStore } from "@/store/plan-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function PlanDebugBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [persistedDraftInfo, setPersistedDraftInfo] = useState<{
    mode: string | null
    originalPlanId: string | null
  }>({ mode: null, originalPlanId: null })

  // --- Select State Individually from Zustand Store ---
  const mode = usePlanStore((state) => state.mode)
  const draftPlan = usePlanStore((state) => state.draftPlan)
  const originalPlanId = usePlanStore((state) => state.originalPlanId)
  const hasUnsavedChanges = usePlanStore((state) => state.hasUnsavedChanges)
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const activePlan = usePlanStore((state) => state.activePlan)
  // --- End of Zustand State Selection ---

  // Update persisted draft info every second by checking localStorage directly
  useEffect(() => {
    // Skip in server-side rendering
    if (typeof window === "undefined") return

    const updatePersistedInfo = () => {
      try {
        // Use the correct localStorage keys defined in the store
        const mode = localStorage.getItem("planStoreDraft_mode")
        const originalPlanId = localStorage.getItem("planStoreDraft_originalId")
        setPersistedDraftInfo({
          mode,
          originalPlanId,
        })
      } catch (err) {
        console.error("Error reading localStorage in debug bar:", err)
        setPersistedDraftInfo({ mode: null, originalPlanId: null })
      }
    }

    // Initial check
    updatePersistedInfo()

    // Set up interval
    const intervalId = setInterval(updatePersistedInfo, 1000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, []) // Empty dependency array ensures this runs only once on mount

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed left-4 bottom-4 z-50 bg-white shadow-md text-black" // Added text-black for visibility
        onClick={() => setIsVisible(true)}
      >
        Show Debug
      </Button>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800 text-white p-3 z-50 text-xs shadow-lg">
      <div className="flex justify-between items-start">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {/* Mode */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Mode:</span>
            <Badge
              variant={
                mode === "normal" ? "outline" : mode === "edit" ? "destructive" : "secondary"
              }
            >
              {mode}
            </Badge>
          </div>

          {/* Unsaved Changes */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Unsaved:</span>
            <Badge variant={hasUnsavedChanges ? "destructive" : "outline"}>
              {hasUnsavedChanges ? "Yes" : "No"}
            </Badge>
          </div>

          {/* Original Plan ID */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Original ID:</span>
            <code className="bg-slate-700 px-1 rounded">{originalPlanId || "null"}</code>
          </div>

          {/* Active Plan ID */}
          <div className="flex items-center gap-2">
            <span className="font-semibold">Active ID:</span>
            <code className="bg-slate-700 px-1 rounded">{activePlanId || "null"}</code>
          </div>

          {/* Draft Plan Name */}
          <div className="col-span-2 flex items-center gap-2">
            <span className="font-semibold">Draft Name:</span>
            <span className="truncate">{draftPlan?.metadata?.planName || "null"}</span>
          </div>

          {/* Active Plan Name */}
          <div className="col-span-2 flex items-center gap-2">
            <span className="font-semibold">Active Name:</span>
            <span className="truncate">{activePlan?.metadata?.planName || "null"}</span>
          </div>

          {/* Persisted Draft Info */}
          <div className="col-span-2 border-t border-slate-600 mt-2 pt-2">
            <span className="font-semibold">Persisted Draft (localStorage):</span>
            <div className="grid grid-cols-2 pl-4 mt-1">
              <div className="flex items-center gap-2">
                <span>Mode:</span>
                <Badge
                  variant={
                    !persistedDraftInfo.mode || persistedDraftInfo.mode === "normal"
                      ? "outline"
                      : persistedDraftInfo.mode === "edit"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {persistedDraftInfo.mode || "null"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Original ID:</span>
                <code className="bg-slate-700 px-1 rounded">
                  {persistedDraftInfo.originalPlanId || "null"}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-slate-700 h-6 w-6" // Made smaller
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-slate-400 text-[10px] mt-2">Debug info updated every second.</div>
    </div>
  )
}
