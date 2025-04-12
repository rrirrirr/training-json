"use client"

import React from "react"
import { TrainingPlanData } from "@/types/training-plan"
import { usePlanStore } from "@/store/plan-store"
import { useRouter } from "next/navigation"

// A component that handles custom events related to plans
export function PlanEventHandler({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const createPlan = usePlanStore((state) => state.createPlan)
  
  // Event listener for handling plan creation from JSON
  React.useEffect(() => {
    const handlePlanCreation = async (e: CustomEvent<{ data: TrainingPlanData }>) => {
      const data = e.detail.data;
      if (data && data.metadata && data.metadata.planName) {
        // Use the planName from metadata
        const planName = data.metadata.planName;
        const newPlanId = await createPlan(planName, data);
        
        if (newPlanId) {
          // Navigate to the new plan
          router.push(`/plan/${newPlanId}`);
        }
      }
    };

    // @ts-ignore - Custom event type
    window.addEventListener('plan-created-from-json', handlePlanCreation);
    
    return () => {
      // @ts-ignore - Custom event type
      window.removeEventListener('plan-created-from-json', handlePlanCreation);
    };
  }, [createPlan, router]);
  
  // This component doesn't render anything visible
  return <>{children}</>;
}