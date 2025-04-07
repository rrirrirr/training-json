"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import type { TrainingPlanData } from "@/types/training-plan"

// Define the saved training plan structure with name and data
export interface SavedTrainingPlan {
  id: string
  name: string
  data: TrainingPlanData
  createdAt: number // timestamp
  updatedAt: number // timestamp
}

// Context interface
interface TrainingPlanContextType {
  plans: SavedTrainingPlan[]
  currentPlan: SavedTrainingPlan | null
  setCurrentPlan: (plan: SavedTrainingPlan | null) => void
  addPlan: (name: string, data: TrainingPlanData) => void
  updatePlan: (id: string, updates: Partial<SavedTrainingPlan>) => void
  deletePlan: (id: string) => void
  savePlans: () => void
}

// Create context with default values
const TrainingPlanContext = createContext<TrainingPlanContextType>({
  plans: [],
  currentPlan: null,
  setCurrentPlan: () => {},
  addPlan: () => {},
  updatePlan: () => {},
  deletePlan: () => {},
  savePlans: () => {},
})

// Storage key for localStorage
const STORAGE_KEY = "training-plans"

// Provider component
export function TrainingPlanProvider({ children }: { children: React.ReactNode }) {
  const [plans, setPlans] = useState<SavedTrainingPlan[]>([])
  const [currentPlan, setCurrentPlan] = useState<SavedTrainingPlan | null>(null)

  // Load saved plans from localStorage on mount
  useEffect(() => {
    const loadPlans = () => {
      try {
        const savedPlans = localStorage.getItem(STORAGE_KEY)
        if (savedPlans) {
          const parsedPlans = JSON.parse(savedPlans) as SavedTrainingPlan[]
          setPlans(parsedPlans)

          // Select the most recently updated plan as current if there are any
          if (parsedPlans.length > 0) {
            const sortedPlans = [...parsedPlans].sort((a, b) => b.updatedAt - a.updatedAt)
            setCurrentPlan(sortedPlans[0])
          }
        }
      } catch (error) {
        console.error("Failed to load training plans:", error)
      }
    }

    loadPlans()
  }, [])

  // Save plans to localStorage whenever plans change
  const savePlans = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    } catch (error) {
      console.error("Failed to save training plans:", error)
    }
  }

  // Add a new plan
  const addPlan = (name: string, data: TrainingPlanData) => {
    const timestamp = Date.now()
    const newPlan: SavedTrainingPlan = {
      id: `plan_${timestamp}`,
      name,
      data,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    const updatedPlans = [...plans, newPlan]
    setPlans(updatedPlans)
    setCurrentPlan(newPlan)

    // Save to localStorage
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans))
    }, 0)
  }

  // Update an existing plan
  const updatePlan = (id: string, updates: Partial<SavedTrainingPlan>) => {
    const updatedPlans = plans.map((plan) => {
      if (plan.id === id) {
        const updatedPlan = {
          ...plan,
          ...updates,
          updatedAt: Date.now(),
        }

        // If we're updating the current plan, also update currentPlan state
        if (currentPlan?.id === id) {
          setCurrentPlan(updatedPlan)
        }

        return updatedPlan
      }
      return plan
    })

    setPlans(updatedPlans)

    // Save to localStorage
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans))
    }, 0)
  }

  // Delete a plan
  const deletePlan = (id: string) => {
    const updatedPlans = plans.filter((plan) => plan.id !== id)
    setPlans(updatedPlans)

    // If we're deleting the current plan, set the most recent as current
    // or null if no plans remain
    if (currentPlan?.id === id) {
      if (updatedPlans.length > 0) {
        const sortedPlans = [...updatedPlans].sort((a, b) => b.updatedAt - a.updatedAt)
        setCurrentPlan(sortedPlans[0])
      } else {
        setCurrentPlan(null)
      }
    }

    // Save to localStorage
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans))
    }, 0)
  }

  return (
    <TrainingPlanContext.Provider
      value={{
        plans,
        currentPlan,
        setCurrentPlan,
        addPlan,
        updatePlan,
        deletePlan,
        savePlans,
      }}
    >
      {children}
    </TrainingPlanContext.Provider>
  )
}

// Custom hook to use the context
export function useTrainingPlans() {
  const context = useContext(TrainingPlanContext)
  if (context === undefined) {
    throw new Error("useTrainingPlans must be used within a TrainingPlanProvider")
  }
  return context
}
