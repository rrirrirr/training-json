"use client"

import { useState } from "react"
import { usePlanStore } from "@/store/plan-store"
import { cn } from "@/lib/utils"

export function PlanModeIndicator() {
  // We need to set up error handling without violating hooks rules
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Get data from the store
  const mode = usePlanStore((state) => state.mode);
  const draftPlan = usePlanStore((state) => state.draftPlan);
  
  const modeData = {
    mode,
    planName: draftPlan?.metadata?.planName || "Unnamed Plan"
  };
  
  // Debug: Always show even in normal mode
  const forceShow = true;
  
  // If in normal mode and not forcing show, don't render anything
  if (modeData.mode === "normal" && !forceShow) {
    return null;
  }
  
  // Set styles based on mode
  const styles = {
    edit: {
      bg: "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300",
      icon: "🖊️"
    },
    view: {
      bg: "bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800",
      text: "text-amber-700 dark:text-amber-300",
      icon: "👁️"
    },
    normal: {
      bg: "bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800",
      text: "text-gray-700 dark:text-gray-300",
      icon: "🔍"
    }
  };
  
  const currentStyle = styles[modeData.mode] || styles.normal;
  
  return (
    <div className={cn(
      "px-4 py-2 border-b-2 text-sm flex items-center justify-center",
      currentStyle.bg,
      modeData.mode === "normal" ? "!border-gray-500" : "!border-blue-500"
    )}
    data-testid="edit-mode-indicator"
    >
      <span className="mr-2">{currentStyle.icon}</span>
      <span className={cn("font-medium", currentStyle.text)}>
        {modeData.mode === "normal" ? 
          "DEBUG - Normal Mode" : 
          modeData.mode === "edit" ? 
            `Editing: ${modeData.planName}` : 
            `Viewing: ${modeData.planName}`
        }
      </span>
    </div>
  );
}