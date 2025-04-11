'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePlanStore } from '@/store/plan-store'
import { exampleTrainingPlan } from '@/utils/example-training-plan'
import { Loader2 } from 'lucide-react'
import WelcomeScreen from '@/components/welcome-screen'
import type { TrainingPlanData } from '@/types/training-plan'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [createPlanInProgress, setCreatePlanInProgress] = useState(false)
  
  // Get store actions
  const createPlan = usePlanStore((state) => state.createPlan)
  const activePlan = usePlanStore((state) => state.activePlan)
  const loadPlansFromStorage = usePlanStore((state) => state.loadPlansFromStorage)
  
  // On first load, check if we have plans in localStorage
  useEffect(() => {
    // Load plans from localStorage
    loadPlansFromStorage()
    
    // Initial check for redirection
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [loadPlansFromStorage])

  // Handle loading the example plan
  const handleLoadExample = async () => {
    if (createPlanInProgress) return
    
    setCreatePlanInProgress(true)
    try {
      // Create the example plan in Supabase and get its ID
      const planId = await createPlan(exampleTrainingPlan)
      
      if (planId) {
        // Redirect to the plan page
        router.push(`/plan/${planId}`)
      } else {
        console.error('Failed to create example plan')
        setCreatePlanInProgress(false)
      }
    } catch (error) {
      console.error('Error creating example plan:', error)
      setCreatePlanInProgress(false)
    }
  }

  // Handle importing a plan
  const handleImportPlan = async (data: TrainingPlanData) => {
    if (createPlanInProgress) return
    
    setCreatePlanInProgress(true)
    try {
      // Create the plan in Supabase and get its ID
      const planId = await createPlan(data)
      
      if (planId) {
        // Redirect to the plan page
        router.push(`/plan/${planId}`)
      } else {
        console.error('Failed to create imported plan')
        setCreatePlanInProgress(false)
      }
    } catch (error) {
      console.error('Error creating imported plan:', error)
      setCreatePlanInProgress(false)
    }
  }

  // If we're still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If a plan creation is in progress, show a loading indicator
  if (createPlanInProgress) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Creating Plan...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we set up your training plan</p>
        </div>
      </div>
    )
  }

  // Show the welcome screen
  return (
    <WelcomeScreen 
      onLoadExample={handleLoadExample} 
      onImportData={handleImportPlan}
    />
  )
}
