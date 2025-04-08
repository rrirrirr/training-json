"use client"

import React, { useContext } from "react"
import { TrainingPlanContext } from "./training-plan-context"
import { TrainingPlanData } from "@/types/training-plan"
import { v4 as uuidv4 } from "uuid"

// A controller component that handles plan creation logic
export function TrainingPlanProvider({ children }: { children: React.ReactNode }) {
  // Original code is in training-plan-context.tsx, we're just adding a wrapper here
  // to handle the modified behavior for handling new plans with metadata
  
  // Event listener for handling plan creation from JSON
  React.useEffect(() => {
    const handlePlanCreation = (e: CustomEvent<{ data: TrainingPlanData }>) => {
      const data = e.detail.data;
      if (data && data.metadata && data.metadata.planName) {
        // Use the planName from metadata
        addPlan(data.metadata.planName, data);
      }
    };

    // @ts-ignore - Custom event type
    window.addEventListener('plan-created-from-json', handlePlanCreation);
    
    return () => {
      // @ts-ignore - Custom event type
      window.removeEventListener('plan-created-from-json', handlePlanCreation);
    };
  }, []);

  // Get the original context
  const context = useContext(TrainingPlanContext);
  
  if (!context) {
    throw new Error("useTrainingPlans must be used within a TrainingPlanProvider");
  }
  
  // Destructure the addPlan function
  const { addPlan } = context;
  
  return (
    <>{children}</>
  );
}
