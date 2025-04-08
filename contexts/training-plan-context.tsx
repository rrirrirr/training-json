// contexts/training-plan-context.tsx (Conceptual - IMPLEMENT MISSING LOGIC)
"use client" // Provider likely needs to be a client component

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from "react"
import type { TrainingPlanData, Week, MonthBlock } from "@/types/training-plan" // Assuming types are correct
import { v4 as uuidv4 } from "uuid" // Example: for generating unique IDs

// Define the shape of a saved plan (adjust if needed)
export interface SavedTrainingPlan {
  id: string
  name: string
  data: TrainingPlanData
  createdAt: number
  updatedAt: number
}

// Define the context shape including new UI state/actions
interface ITrainingPlanContext {
  plans: SavedTrainingPlan[]
  currentPlan: SavedTrainingPlan | null
  addPlan: (name: string, data: TrainingPlanData) => void
  updatePlan: (
    id: string,
    updates: Partial<
      Omit<SavedTrainingPlan, "id" | "createdAt" | "updatedAt"> & { data?: TrainingPlanData }
    >
  ) => void
  deletePlan: (id: string) => void
  setCurrentPlan: (plan: SavedTrainingPlan | null) => void

  // UI State & Actions
  selectedWeek: number | null
  selectedMonth: number
  viewMode: "week" | "month"
  weeksForSidebar: number[]
  monthsForSidebar: MonthBlock[]
  trainingData: Week[] // Pass full week data

  selectWeek: (week: number) => void
  selectMonth: (monthId: number) => void
  changeViewMode: (mode: "week" | "month") => void
}

const TrainingPlanContext = createContext<ITrainingPlanContext | undefined>(undefined)

export const TrainingPlanProvider = ({ children }: { children: React.ReactNode }) => {
  const [plans, setPlans] = useState<SavedTrainingPlan[]>([])
  const [currentPlan, setCurrentPlanInternal] = useState<SavedTrainingPlan | null>(null)
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number>(1)
  const [viewMode, setViewMode] = useState<"week" | "month">("month")
  const [isLoaded, setIsLoaded] = useState(false) // Track loading state

  // --- Load from Local Storage ---
  useEffect(() => {
    try {
      const storedPlans = localStorage.getItem("trainingPlans")
      const loadedPlans = storedPlans ? JSON.parse(storedPlans) : []
      setPlans(loadedPlans)

      const storedCurrentPlanId = localStorage.getItem("currentTrainingPlanId")
      let loadedCurrentPlan: SavedTrainingPlan | null = null
      if (storedCurrentPlanId && loadedPlans.length > 0) {
        loadedCurrentPlan =
          loadedPlans.find((p: SavedTrainingPlan) => p.id === storedCurrentPlanId) || null
      }

      // Set initial state based on loaded plan ONLY if one is loaded
      if (loadedCurrentPlan) {
        setCurrentPlanInternal(loadedCurrentPlan)
        const firstMonthId = loadedCurrentPlan.data?.monthBlocks?.[0]?.id ?? 1
        const firstWeek = loadedCurrentPlan.data?.monthBlocks?.[0]?.weeks?.[0]
        setSelectedMonth(firstMonthId)
        if (firstWeek !== undefined) {
          setSelectedWeek(firstWeek)
          setViewMode("week")
        } else {
          setSelectedWeek(null)
          setViewMode("month")
        }
      } else {
        // Default state if no plan is loaded
        setCurrentPlanInternal(null)
        setSelectedMonth(1)
        setSelectedWeek(null)
        setViewMode("month")
      }
    } catch (error) {
      console.error("Failed to load from local storage:", error)
      // Set default state on error
      setPlans([])
      setCurrentPlanInternal(null)
      setSelectedMonth(1)
      setSelectedWeek(null)
      setViewMode("month")
    } finally {
      setIsLoaded(true) // Mark as loaded
    }
  }, [])

  // --- Save to Local Storage ---
  useEffect(() => {
    if (!isLoaded) return // Don't save until loaded
    try {
      localStorage.setItem("trainingPlans", JSON.stringify(plans))
      if (currentPlan) {
        localStorage.setItem("currentTrainingPlanId", currentPlan.id)
      } else {
        localStorage.removeItem("currentTrainingPlanId")
      }
    } catch (error) {
      console.error("Failed to save to local storage:", error)
    }
  }, [plans, currentPlan, isLoaded])

  // --- CRUD Actions ---
  const addPlan = useCallback((name: string, data: TrainingPlanData) => {
    const newPlan: SavedTrainingPlan = {
      id: uuidv4(),
      name,
      data,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setPlans((prevPlans) => [...prevPlans, newPlan])
    setCurrentPlan(newPlan) // Automatically select the new plan
    // Reset UI state for the new plan
    const firstMonthId = data?.monthBlocks?.[0]?.id ?? 1
    const firstWeek = data?.monthBlocks?.[0]?.weeks?.[0]
    setSelectedMonth(firstMonthId)
    if (firstWeek !== undefined) {
      setSelectedWeek(firstWeek)
      setViewMode("week")
    } else {
      setSelectedWeek(null)
      setViewMode("month")
    }
  }, []) // Add dependencies if needed

  const updatePlan = useCallback(
    (
      id: string,
      updates: Partial<
        Omit<SavedTrainingPlan, "id" | "createdAt" | "updatedAt"> & { data?: TrainingPlanData }
      >
    ) => {
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === id
            ? {
                ...plan,
                ...updates,
                data: updates.data ?? plan.data, // Ensure data is updated correctly
                updatedAt: Date.now(),
              }
            : plan
        )
      )
      // If updating the current plan, update the currentPlan state variable too
      if (currentPlan?.id === id) {
        setCurrentPlanInternal((prev) =>
          prev
            ? {
                ...prev,
                ...updates,
                data: updates.data ?? prev.data,
                updatedAt: Date.now(),
              }
            : null
        )
      }
    },
    [currentPlan]
  ) // Add dependencies

  const deletePlan = useCallback(
    (id: string) => {
      setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== id))
      if (currentPlan?.id === id) {
        // Find the next available plan to select, or null
        const remainingPlans = plans.filter((plan) => plan.id !== id)
        setCurrentPlan(remainingPlans.length > 0 ? remainingPlans[0] : null)
      }
    },
    [currentPlan, plans]
  ) // Add dependencies

  // --- Set Current Plan (Memoized) ---
  const setCurrentPlan = useCallback((plan: SavedTrainingPlan | null) => {
    setCurrentPlanInternal(plan)
    // Reset UI state when changing plans
    if (plan) {
      const firstMonthId = plan.data?.monthBlocks?.[0]?.id ?? 1
      const firstWeek = plan.data?.monthBlocks?.[0]?.weeks?.[0]
      setSelectedMonth(firstMonthId)
      if (firstWeek !== undefined) {
        setSelectedWeek(firstWeek)
        setViewMode("week")
      } else {
        setSelectedWeek(null)
        setViewMode("month")
      }
    } else {
      // Reset if no plan selected
      setSelectedMonth(1)
      setSelectedWeek(null)
      setViewMode("month")
    }
  }, [])

  // --- UI Actions (Memoized) ---
  const selectWeek = useCallback(
    (week: number) => {
      setSelectedWeek(week)
      setViewMode("week")
      const month = currentPlan?.data.monthBlocks.find((m) => m.weeks.includes(week))
      if (month && month.id !== selectedMonth) {
        setSelectedMonth(month.id)
      }
    },
    [currentPlan, selectedMonth]
  )

  const selectMonth = useCallback((monthId: number) => {
    setSelectedMonth(monthId)
    setViewMode("month")
    setSelectedWeek(null)
  }, [])

  const changeViewMode = useCallback(
    (mode: "week" | "month") => {
      setViewMode(mode)
      if (mode === "month" && selectedWeek !== null && currentPlan) {
        const month = currentPlan.data.monthBlocks.find((m) => m.weeks.includes(selectedWeek))
        if (month) setSelectedMonth(month.id)
        setSelectedWeek(null)
      } else if (mode === "week" && selectedWeek === null && currentPlan) {
        // If switching to week view with no week selected, maybe select first week of current month?
        const firstWeekOfMonth = currentPlan.data.monthBlocks.find((m) => m.id === selectedMonth)
          ?.weeks[0]
        if (firstWeekOfMonth !== undefined) {
          setSelectedWeek(firstWeekOfMonth)
        }
      }
    },
    [selectedWeek, currentPlan, selectedMonth]
  )

  // --- Derived Data (Memoized) ---
  const weeksForSidebar = useMemo(() => {
    return currentPlan?.data.weeks.map((w) => w.weekNumber).sort((a, b) => a - b) || []
  }, [currentPlan])

  const monthsForSidebar = useMemo(() => {
    return currentPlan?.data.monthBlocks || []
  }, [currentPlan])

  const trainingData = useMemo(() => {
    // Pass full week data for getWeekInfo
    return currentPlan?.data.weeks || []
  }, [currentPlan])

  // --- Context Value ---
  const value = useMemo(
    () => ({
      plans,
      currentPlan,
      addPlan,
      updatePlan,
      deletePlan,
      setCurrentPlan,
      selectedWeek,
      selectedMonth,
      viewMode,
      selectWeek,
      selectMonth,
      changeViewMode,
      weeksForSidebar,
      monthsForSidebar,
      trainingData,
    }),
    [
      plans,
      currentPlan,
      addPlan,
      updatePlan,
      deletePlan,
      setCurrentPlan, // Existing
      selectedWeek,
      selectedMonth,
      viewMode, // New state
      selectWeek,
      selectMonth,
      changeViewMode, // New actions
      weeksForSidebar,
      monthsForSidebar,
      trainingData, // New derived data
    ]
  )

  // Render null or a loader until loaded from storage to prevent hydration issues
  if (!isLoaded) {
    return null // Or a loading spinner maybe
  }

  return <TrainingPlanContext.Provider value={value}>{children}</TrainingPlanContext.Provider>
}

// Custom hook remains the same
export const useTrainingPlans = (): ITrainingPlanContext => {
  const context = useContext(TrainingPlanContext)
  if (context === undefined) {
    throw new Error("useTrainingPlans must be used within a TrainingPlanProvider")
  }
  return context
}
