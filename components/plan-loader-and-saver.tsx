'use client'

import { useEffect } from 'react'
import type { TrainingPlanData } from '@/types/training-plan'
import { usePlanStore } from '@/store/plan-store'

// Define props for this component
interface PlanLoaderAndSaverProps {
  planData: TrainingPlanData
  planId: string
}

/**
 * This component doesn't render anything visible.
 * It's responsible for synchronizing the server-fetched plan data
 * with the Zustand store and localStorage.
 */
export default function PlanLoaderAndSaver({ planData, planId }: PlanLoaderAndSaverProps) {
  // Get the setActivePlan function from Zustand
  const setActivePlan = usePlanStore((state) => state.setActivePlan)
  
  // When planData changes, update the Zustand store and localStorage
  useEffect(() => {
    if (planData) {
      // Update the Zustand store
      setActivePlan(planData)
      
      // Log the action
      console.log(`Plan loaded: ${planData.metadata?.planName || 'Unnamed Plan'} (ID: ${planId})`)
    }
  }, [planData, planId, setActivePlan])
  
  // This component doesn't render any visible UI
  return null
}
