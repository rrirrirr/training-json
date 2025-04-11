import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TrainingPlanData } from "@/types/training-plan"
import { supabase } from "@/lib/supa-client"

// Type for plan metadata (lightweight summary for navigation)
export interface PlanMetadata {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

// Define the expanded state structure
interface PlanState {
  // Main data
  activePlan: TrainingPlanData | null
  activePlanId: string | null
  planMetadataList: PlanMetadata[]
  
  // UI states
  isLoading: boolean
  error: string | null
  
  // Selected view states
  selectedWeek: number | null
  selectedMonth: number
  viewMode: "week" | "month"
  
  // Actions for plan data management
  setActivePlan: (plan: TrainingPlanData, planId: string) => void
  clearActivePlan: () => void
  fetchPlanMetadata: () => Promise<void>
  
  // Actions for creating and updating plans
  createPlan: (name: string, planData: TrainingPlanData) => Promise<string | null>
  createPlanFromEdit: (
    originalId: string, 
    updatedPlan: TrainingPlanData, 
    newName?: string
  ) => Promise<string | null>
  removeLocalPlan: (planId: string) => Promise<boolean>
  
  // View state actions
  selectWeek: (weekNumber: number | null) => void
  selectMonth: (monthId: number) => void
  setViewMode: (mode: "week" | "month") => void
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      // Initial state
      activePlan: null,
      activePlanId: null,
      planMetadataList: [],
      isLoading: false,
      error: null,
      selectedWeek: null,
      selectedMonth: 1,
      viewMode: "month",
      
      // Set the active plan with its ID
      setActivePlan: (plan, planId) => {
        console.log(`Setting active plan: ${plan?.metadata?.planName || "Unknown"} (ID: ${planId})`)
        
        // Save the ID to localStorage for future visits
        localStorage.setItem("lastViewedPlanId", planId)
        
        // Update the state
        set({ 
          activePlan: plan, 
          activePlanId: planId,
          error: null 
        })
        
        // Initialize view state based on plan data
        const firstMonthId = plan?.monthBlocks?.[0]?.id ?? 1
        set({ selectedMonth: firstMonthId })
      },
      
      // Clear the active plan
      clearActivePlan: () => {
        localStorage.removeItem("lastViewedPlanId")
        set({ 
          activePlan: null, 
          activePlanId: null,
          selectedWeek: null,
          selectedMonth: 1
        })
      },
      
      // Fetch plan metadata for navigation
      fetchPlanMetadata: async () => {
        try {
          set({ isLoading: true, error: null })
          
          const { data, error } = await supabase
            .from("training_plans")
            .select("id, name, created_at, updated_at")
            .order("updated_at", { ascending: false })
          
          if (error) throw error
          
          // Format the metadata
          const planMetadata: PlanMetadata[] = data.map(plan => ({
            id: plan.id,
            name: plan.name,
            createdAt: plan.created_at,
            updatedAt: plan.updated_at || plan.created_at
          }))
          
          set({ planMetadataList: planMetadata, isLoading: false })
        } catch (err) {
          console.error("Error fetching plan metadata:", err)
          set({ 
            error: err instanceof Error ? err.message : "Unknown error fetching plans",
            isLoading: false
          })
        }
      },
      
      // Create a new plan in Supabase
      createPlan: async (name, planData) => {
        try {
          set({ isLoading: true, error: null })
          
          // Ensure planData has metadata with planName
          if (!planData.metadata) {
            planData.metadata = { planName: name, creationDate: new Date().toISOString() }
          } else if (!planData.metadata.planName) {
            planData.metadata.planName = name
          }
          
          // Insert into Supabase
          const { data, error } = await supabase
            .from("training_plans")
            .insert({
              name: name,
              plan_data: planData
            })
            .select("id")
            .single()
          
          if (error) throw error
          
          // Update metadata list after creation
          get().fetchPlanMetadata()
          
          set({ isLoading: false })
          return data?.id || null
        } catch (err) {
          console.error("Error creating plan:", err)
          set({ 
            error: err instanceof Error ? err.message : "Unknown error creating plan", 
            isLoading: false 
          })
          return null
        }
      },
      
      // Create a new plan from edited data (immutability)
      createPlanFromEdit: async (originalId, updatedPlan, newName) => {
        try {
          set({ isLoading: true, error: null })
          
          // Get the original plan's metadata from the list
          const originalPlanMetadata = get().planMetadataList.find(p => p.id === originalId)
          
          // Use provided name or fallback to original name + "(Edited)"
          const planName = newName || 
            (updatedPlan.metadata?.planName ? 
              `${updatedPlan.metadata.planName} (Edited)` : 
              `${originalPlanMetadata?.name || "Plan"} (Edited)`)
          
          // Ensure updated plan has metadata with the new name
          if (!updatedPlan.metadata) {
            updatedPlan.metadata = { planName, creationDate: new Date().toISOString() }
          } else {
            updatedPlan.metadata.planName = planName
          }
          
          // Insert as a new plan in Supabase
          const { data, error } = await supabase
            .from("training_plans")
            .insert({
              name: planName,
              plan_data: updatedPlan
            })
            .select("id")
            .single()
          
          if (error) throw error
          
          // Update metadata list after creation
          get().fetchPlanMetadata()
          
          set({ isLoading: false })
          return data?.id || null
        } catch (err) {
          console.error("Error creating edited plan:", err)
          set({ 
            error: err instanceof Error ? err.message : "Unknown error creating edited plan", 
            isLoading: false 
          })
          return null
        }
      },
      
      // Remove a plan from local state only (not from Supabase)
      removeLocalPlan: async (planId) => {
        try {
          // Check if we're removing the active plan
          if (get().activePlanId === planId) {
            get().clearActivePlan()
          }
          
          // Update the metadata list to remove this plan
          const updatedList = get().planMetadataList.filter(p => p.id !== planId)
          set({ planMetadataList: updatedList })
          
          return true
        } catch (err) {
          console.error("Error removing local plan:", err)
          return false
        }
      },
      
      // Set the selected week
      selectWeek: (weekNumber) => {
        set({ selectedWeek: weekNumber })
        
        // If setting a week, ensure view mode is "week"
        if (weekNumber !== null) {
          set({ viewMode: "week" })
          
          // Find the month block this week belongs to and set selectedMonth
          const activePlan = get().activePlan
          if (activePlan) {
            const monthBlock = activePlan.monthBlocks.find(block => 
              block.weeks.includes(weekNumber)
            )
            if (monthBlock) {
              set({ selectedMonth: monthBlock.id })
            }
          }
        }
      },
      
      // Set the selected month
      selectMonth: (monthId) => {
        set({ 
          selectedMonth: monthId,
          // Clear week selection when changing month
          selectedWeek: null,
          // Switch to month view when selecting a month
          viewMode: "month" 
        })
      },
      
      // Set the view mode
      setViewMode: (mode) => {
        set({ viewMode: mode })
        
        // If switching to month view, clear week selection
        if (mode === "month") {
          set({ selectedWeek: null })
        } 
        // If switching to week view with no week selected, try to select first week of current month
        else if (mode === "week" && get().selectedWeek === null) {
          const activePlan = get().activePlan
          const selectedMonth = get().selectedMonth
          
          if (activePlan) {
            const monthBlock = activePlan.monthBlocks.find(b => b.id === selectedMonth)
            if (monthBlock && monthBlock.weeks.length > 0) {
              // Select the first week of the month
              set({ selectedWeek: monthBlock.weeks[0] })
            }
          }
        }
      }
    }),
    {
      name: "training-plan-storage",
      // Only persist view state and metadata, not the full plans (which could be large)
      partialize: (state) => ({
        selectedWeek: state.selectedWeek,
        selectedMonth: state.selectedMonth,
        viewMode: state.viewMode,
        planMetadataList: state.planMetadataList,
      }),
    }
  )
)
