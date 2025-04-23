"use client"

import { useState, useEffect } from "react"
import { usePlanMode } from "@/contexts/plan-mode-context"
import { usePlanStore } from "@/store/plan-store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function PlanDebugBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [persistedDraftInfo, setPersistedDraftInfo] = useState<{ mode: string | null; originalPlanId: string | null }>({ mode: null, originalPlanId: null })
  
  const { 
    mode, 
    draftPlan, 
    originalPlanId, 
    hasUnsavedChanges,
    getPersistedDraftInfo 
  } = usePlanMode()
  
  const { 
    activePlanId, 
    activePlan 
  } = usePlanStore()

  // Update persisted draft info every second
  useEffect(() => {
    const updatePersistedInfo = () => {
      const info = getPersistedDraftInfo()
      setPersistedDraftInfo(info)
    }

    // Initial check
    updatePersistedInfo()
    
    // Set up interval
    const intervalId = setInterval(updatePersistedInfo, 1000)
    
    return () => clearInterval(intervalId)
  }, [getPersistedDraftInfo])

  if (!isVisible) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="fixed left-4 bottom-4 z-50 bg-white shadow-md"
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
          <div className="flex items-center gap-2">
            <span className="font-semibold">Mode:</span>
            <Badge variant={mode === "normal" ? "outline" : (mode === "edit" ? "destructive" : "secondary")}>
              {mode}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold">Unsaved Changes:</span>
            <Badge variant={hasUnsavedChanges ? "destructive" : "outline"}>
              {hasUnsavedChanges ? "Yes" : "No"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold">Original Plan ID:</span>
            <code className="bg-slate-700 px-1 rounded">{originalPlanId || "null"}</code>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold">Active Plan ID:</span>
            <code className="bg-slate-700 px-1 rounded">{activePlanId || "null"}</code>
          </div>
          
          <div className="col-span-2 flex items-center gap-2">
            <span className="font-semibold">Draft Plan Name:</span>
            <span>{draftPlan?.metadata?.planName || "No draft plan"}</span>
          </div>
          
          <div className="col-span-2 flex items-center gap-2">
            <span className="font-semibold">Active Plan Name:</span>
            <span>{activePlan?.metadata?.planName || "No active plan"}</span>
          </div>
          
          <div className="col-span-2 border-t border-slate-600 mt-2 pt-2">
            <span className="font-semibold">Persisted Draft:</span>
            <div className="grid grid-cols-2 pl-4 mt-1">
              <div className="flex items-center gap-2">
                <span>Mode:</span>
                <Badge variant={!persistedDraftInfo.mode ? "outline" : (persistedDraftInfo.mode === "edit" ? "destructive" : "secondary")}>
                  {persistedDraftInfo.mode || "null"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span>Original ID:</span>
                <code className="bg-slate-700 px-1 rounded">{persistedDraftInfo.originalPlanId || "null"}</code>
              </div>
            </div>
          </div>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="text-white hover:bg-slate-700" 
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-slate-400 text-[10px] mt-2">
        Debug info updated every second. Re-renders don't affect application performance.
      </div>
    </div>
  )
}
