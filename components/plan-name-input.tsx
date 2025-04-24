"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePlanStore } from "@/store/plan-store" 
import { useState, useEffect } from "react"

export function PlanNameInput() {
  const draftPlan = usePlanStore((state) => state.draftPlan)
  const updateDraftPlan = usePlanStore((state) => state.updateDraftPlan)
  const [planName, setPlanName] = useState("")

  // Initialize the plan name from the draft plan
  useEffect(() => {
    if (draftPlan?.metadata?.planName) {
      setPlanName(draftPlan.metadata.planName)
    }
  }, [draftPlan])

  // Handle updates to the plan name
  const handlePlanNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setPlanName(newName)
    
    if (draftPlan) {
      const updatedPlan = {
        ...draftPlan,
        metadata: {
          ...(draftPlan.metadata || {}),
          planName: newName
        }
      }
      updateDraftPlan(updatedPlan)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="plan-name">Plan Name</Label>
      <Input 
        id="plan-name"
        value={planName}
        onChange={handlePlanNameChange}
        className="w-full"
        data-testid="plan-name-input"
      />
    </div>
  )
}