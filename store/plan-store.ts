import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TrainingPlanData } from "@/types/training-plan" // Adjust path as needed
import { supabase } from "@/lib/supa-client" // Adjust path as needed

// Type for plan metadata (lightweight summary for navigation)
export interface PlanMetadata {
  id: string
  name: string
  createdAt: string // ISO String Date
  updatedAt: string // ISO String Date (Can represent last accessed/modified)
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
  fetchPlanMetadata: (force?: boolean) => Promise<void> // Optional force flag

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

      // Set the active plan with its ID - Handles adding metadata if missing
      setActivePlan: (plan, planId) => {
        console.log(
          `[setActivePlan] Setting active plan: ${plan?.metadata?.planName || "Unknown"} (ID: ${planId})`
        )
        const previousActivePlanId = get().activePlanId // Store previous ID to check if view state needs reset

        // Always set the last viewed ID in localStorage for quick access on next visit
        localStorage.setItem("lastViewedPlanId", planId)

        // Check if metadata exists in the current list
        const currentMetadataList = get().planMetadataList
        const metadataExists = currentMetadataList.some((p) => p.id === planId)

        let nextMetadataList = []

        // Add metadata if it doesn't exist AND we have valid plan data/metadata
        if (!metadataExists && plan?.metadata) {
          console.warn(
            `[setActivePlan] Metadata for active plan ID ${planId} not found in list. Adding.`
          )
          const newPlanMetadata: PlanMetadata = {
            id: planId,
            name: plan.metadata.planName || "Unnamed Plan",
            // Use creationDate from plan if available, otherwise current time as fallback
            createdAt: plan.metadata.creationDate || new Date().toISOString(),
            // Use current time for updatedAt, indicating when it was last loaded/activated
            updatedAt: new Date().toISOString(),
          }
          // Add to the beginning of the list for ordering by last loaded
          nextMetadataList = [newPlanMetadata, ...currentMetadataList.filter(p => p.id !== planId)]
        } else if (metadataExists) {
          // Update existing plan's updatedAt timestamp and move to the front of the list
          console.log(
            `[setActivePlan] Updating last accessed timestamp for plan ID ${planId}.`
          )
          
          // Find the existing plan metadata
          const existingPlanIndex = currentMetadataList.findIndex(p => p.id === planId)
          const existingPlan = currentMetadataList[existingPlanIndex]
          
          // Create updated plan metadata with new timestamp
          const updatedPlan = {
            ...existingPlan,
            updatedAt: new Date().toISOString() // Update the timestamp to now
          }
          
          // Create new list with updated plan at front
          nextMetadataList = [
            updatedPlan,
            ...currentMetadataList.filter(p => p.id !== planId)
          ]
        } else {
          console.warn(
            `[setActivePlan] Metadata for plan ID ${planId} not found, but plan object or its metadata field is missing. Cannot add metadata.`
          )
          nextMetadataList = currentMetadataList
        }
        // Update state including the potentially updated list
        set({
          activePlan: plan,
          activePlanId: planId,
          planMetadataList: nextMetadataList, // Use the potentially updated list
          error: null, // Clear any previous errors
        })

        // Reset view state only if the active plan ID actually changed
        if (previousActivePlanId !== planId) {
          console.log(
            `[setActivePlan] Active plan changed from ${previousActivePlanId} to ${planId}. Resetting view state.`
          )
          
          // Default to the first month block of the new plan, or month 1 if none exist
          const firstMonthId = plan?.monthBlocks?.[0]?.id ?? 1
          
          // Check if we're loading from localStorage (we're visiting a plan we've seen before)
          const lastViewedPlanId = localStorage.getItem("lastViewedPlanId")
          const isVisitingFromStorage = lastViewedPlanId === planId
          
          if (isVisitingFromStorage) {
            // If we're revisiting a plan from storage, keep previous behavior
            // State will be loaded from localStorage's persisted state
            console.log(`[setActivePlan] Revisiting plan ${planId} from storage, keeping current view state`)
            set({ selectedMonth: firstMonthId })
          } else {
            // For new plans, check if we have weeks
            const hasWeeks = Boolean(plan?.weeks?.length)
            const firstWeek = hasWeeks ? plan?.weeks[0]?.weekNumber : null
            
            if (hasWeeks && firstWeek !== null) {
              // If we have weeks, automatically load the first week
              console.log(`[setActivePlan] New plan has weeks. Auto-selecting first week: ${firstWeek}`)
              set({
                selectedMonth: firstMonthId,
                selectedWeek: firstWeek,
                viewMode: "week", // Switch to week view
              })
            } else {
              // If no weeks available, default to month view with first block
              console.log(`[setActivePlan] New plan has no weeks or first week is null. Defaulting to month view`)
              set({
                selectedMonth: firstMonthId,
                selectedWeek: null,
                viewMode: "month",
              })
            }
          }
        } else {
          console.log(
            `[setActivePlan] Active plan ID ${planId} is the same as before. Not resetting view state.`
          )
        }
      },

      // Fetch plan metadata for navigation
      fetchPlanMetadata: async (force = false) => {
        // Added force flag
        try {
          const currentMetadata = get().planMetadataList
          const isLoading = get().isLoading

          // Prevent concurrent fetches unless forced
          if (isLoading && !force) {
            console.log("[fetchPlanMetadata] Fetch already in progress. Skipping.")
            return
          }
          // Fetch if empty OR if forced
          if (force || currentMetadata.length === 0) {
            console.log(
              `[fetchPlanMetadata] Fetching from Supabase. Reason: ${force ? "Forced" : "List empty"}.`
            )
            set({ isLoading: true, error: null })

            // Select only necessary fields for metadata to reduce payload
            const { data, error } = await supabase
              .from("training_plans")
              .select("id, plan_data->metadata->planName, created_at, last_accessed_at") // Select nested properties directly
              .order("last_accessed_at", { ascending: false, nullsFirst: false }) // Order by most recently accessed

            if (error) throw error

            // Ensure data is not null before mapping
            const planMetadata: PlanMetadata[] = (data ?? []).map((plan: any) => ({
              id: plan.id,
              name: plan.planName || "Unnamed Plan", // Access the selected nested property
              createdAt: plan.created_at,
              updatedAt: plan.last_accessed_at || plan.created_at, // Use last accessed if available
            }))

            console.log(`[fetchPlanMetadata] Fetched ${planMetadata.length} metadata items.`)
            // If forcing, replace the list. If just initial load, set the list.
            set({ planMetadataList: planMetadata, isLoading: false })
          } else {
            console.log(
              `[fetchPlanMetadata] Metadata list exists (${currentMetadata.length} items) and not forced. Skipping fetch.`
            )
            set({ isLoading: false }) // Ensure loading is false if skipped
          }
        } catch (err) {
          console.error("Error fetching plan metadata:", err)
          set({
            error: err instanceof Error ? err.message : "Unknown error fetching plans",
            isLoading: false,
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
          } else {
            // Ensure planName is set even if metadata exists
            planData.metadata.planName = name
            if (!planData.metadata.creationDate) {
              planData.metadata.creationDate = new Date().toISOString()
            }
          }

          // Insert into Supabase
          const { data, error } = await supabase
            .from("training_plans")
            .insert({
              plan_data: planData, // Store the whole plan data object
            })
            .select("id, created_at") // Select needed fields for metadata
            .single() // Expecting a single row back

          if (error) throw error
          if (!data) throw new Error("No data returned after insert.")

          // Create new metadata entry for this plan
          const newPlanMetadata: PlanMetadata = {
            id: data.id,
            name: planData.metadata?.planName || name, // Use name from metadata preferentially
            createdAt: data.created_at,
            updatedAt: data.created_at, // Initially, updated equals created
          }

          // Add to metadata list without fetching all plans
          const currentMetadata = get().planMetadataList
          set({
            // Prepend the new plan to the list
            planMetadataList: [newPlanMetadata, ...currentMetadata],
            isLoading: false,
          })

          return data.id // Return the new ID
        } catch (err) {
          console.error("Error creating plan:", err)
          set({
            error: err instanceof Error ? err.message : "Unknown error creating plan",
            isLoading: false,
          })
          return null
        }
      },

      // Create a new plan from edited data (immutability)
      createPlanFromEdit: async (originalId, updatedPlan, newName) => {
        try {
          set({ isLoading: true, error: null })

          // Determine the name for the new plan
          const planName = newName || `${updatedPlan.metadata?.planName || "Plan"} (Edited)`

          // Ensure updated plan has metadata with the new name and creation date
          if (!updatedPlan.metadata) {
            updatedPlan.metadata = { planName, creationDate: new Date().toISOString() }
          } else {
            updatedPlan.metadata.planName = planName
            // Keep original creationDate if it exists, otherwise set new one
            if (!updatedPlan.metadata.creationDate) {
              updatedPlan.metadata.creationDate = new Date().toISOString()
            }
          }

          // Insert as a new plan in Supabase
          const { data, error } = await supabase
            .from("training_plans")
            .insert({
              plan_data: updatedPlan,
            })
            .select("id, created_at")
            .single()

          if (error) throw error
          if (!data) throw new Error("No data returned after insert.")

          // Create new metadata entry for this copied plan
          const newPlanMetadata: PlanMetadata = {
            id: data.id,
            name: planName,
            createdAt: data.created_at,
            updatedAt: data.created_at, // Initially same as created
          }

          // Add to metadata list
          const currentMetadata = get().planMetadataList
          set({
            planMetadataList: [newPlanMetadata, ...currentMetadata],
            isLoading: false,
          })
          return data.id
        } catch (err) {
          console.error("Error creating edited plan:", err)
          set({
            error: err instanceof Error ? err.message : "Unknown error creating edited plan",
            isLoading: false,
          })
          return null
        }
      },

      // Remove a plan from local state only (not from Supabase)
      removeLocalPlan: async (planId) => {
        console.log(`[removeLocalPlan] START - Removing plan ID: ${planId}`)
        const state = get() // Get current state once
        console.log(`[removeLocalPlan] Initial activePlanId: ${state.activePlanId}`)
        let wasActive = state.activePlanId === planId
        let clearedActive = false

        try {
          // Filter the list first
          const listBeforeFilter = state.planMetadataList
          console.log(
            `[removeLocalPlan] List BEFORE filter (${listBeforeFilter.length}):`,
            listBeforeFilter.map((p) => p.id).join(", ")
          )
          const listAfterFilter = listBeforeFilter.filter((p) => p.id !== planId)
          console.log(
            `[removeLocalPlan] List AFTER filter (${listAfterFilter.length}):`,
            listAfterFilter.map((p) => p.id).join(", ")
          )

          // Check if filtering worked (optional but good sanity check)
          if (
            listAfterFilter.length === listBeforeFilter.length &&
            listBeforeFilter.some((p) => p.id === planId)
          ) {
            console.error(
              `[removeLocalPlan] FILTERING FAILED for ID ${planId}! The plan was in the list but not removed.`
            )
            // Decide how to handle this - maybe throw an error or return false early
          } else if (listAfterFilter.length < listBeforeFilter.length) {
            console.log(`[removeLocalPlan] Filtering appears successful for ID ${planId}.`)
          } else if (!listBeforeFilter.some((p) => p.id === planId)) {
            console.warn(
              `[removeLocalPlan] Plan ID ${planId} was already not in the list before filtering.`
            )
          }

          if (wasActive) {
            console.log(
              `[removeLocalPlan] Plan ${planId} was active. Clearing active state and updating list.`
            )
            // Remove from localStorage *before* setting state
            localStorage.removeItem("lastViewedPlanId")
            console.log(`[removeLocalPlan] Removed 'lastViewedPlanId' from localStorage.`)

            // Set all changes atomically
            set({
              activePlan: null,
              activePlanId: null,
              planMetadataList: listAfterFilter,
              // Reset view state as well
              selectedWeek: null,
              selectedMonth: 1, // Or default month logic
              viewMode: "month",
              error: null,
            })
            clearedActive = true
            // Log state *after* the single set call
            console.log(
              `[removeLocalPlan] State updated. New activePlanId (via get()): ${get().activePlanId}`
            )
            if (get().activePlanId !== null) {
              console.error(
                `[removeLocalPlan] CRITICAL: activePlanId is NOT NULL after combined set!`
              )
            }
          } else {
            console.log(`[removeLocalPlan] Plan ${planId} was not active. Only updating list.`)
            // Only update the list if the plan wasn't active
            set({
              planMetadataList: listAfterFilter,
            })
          }

          console.log(
            `[removeLocalPlan] END - State set. Returning true. Active plan was cleared: ${clearedActive}`
          )
          return true // Indicate success
        } catch (err) {
          console.error("[removeLocalPlan] Error during execution:", err)
          set({
            error: err instanceof Error ? err.message : "Unknown error removing local plan",
          })
          return false // Indicate failure
        }
      },

      // No longer need the separate clearActivePlan call inside removeLocalPlan
      // Keep the clearActivePlan action itself if it's used elsewhere directly.
      clearActivePlan: () => {
        console.log(
          `[clearActivePlan] START - Clearing active plan. Current activePlanId: ${get().activePlanId}`
        )
        const currentId = get().activePlanId
        localStorage.removeItem("lastViewedPlanId")
        console.log(
          `[clearActivePlan] Removed 'lastViewedPlanId' from localStorage (was for ID: ${currentId}).`
        )
        set({
          activePlan: null,
          activePlanId: null,
          selectedWeek: null,
          selectedMonth: 1, // Or default month logic
          viewMode: "month",
          error: null,
        })
        console.log(
          `[clearActivePlan] END - State updated. New activePlanId (via get()): ${get().activePlanId}`
        )
        if (get().activePlanId !== null) {
          console.error(`[clearActivePlan] CRITICAL: activePlanId is NOT NULL after set!`)
        }
      },

      // Set the selected week
      selectWeek: (weekNumber) => {
        set({ selectedWeek: weekNumber })

        // If setting a specific week, ensure view mode is "week"
        if (weekNumber !== null) {
          set({ viewMode: "week" })

          // Find the month block this week belongs to and ensure selectedMonth is correct
          const activePlan = get().activePlan
          if (activePlan) {
            const monthBlock = activePlan.monthBlocks.find(
              (block) => block.weeks.includes(weekNumber as number) // Ensure weekNumber is treated as number
            )
            if (monthBlock && get().selectedMonth !== monthBlock.id) {
              console.log(
                `[selectWeek] Auto-selecting month ${monthBlock.id} for week ${weekNumber}`
              )
              set({ selectedMonth: monthBlock.id })
            }
          }
        }
      },

      // Set the selected month
      selectMonth: (monthId) => {
        // Only update if the month actually changes
        if (get().selectedMonth !== monthId) {
          console.log(`[selectMonth] Selecting month ${monthId}`)
          set({
            selectedMonth: monthId,
            // Clear week selection when changing month explicitly
            selectedWeek: null,
            // Switch to month view when selecting a month
            viewMode: "month",
          })
        }
      },

      // Set the view mode
      setViewMode: (mode) => {
        // Only update if the mode actually changes
        if (get().viewMode !== mode) {
          console.log(`[setViewMode] Setting view mode to ${mode}`)
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
              const monthBlock = activePlan.monthBlocks.find((b) => b.id === selectedMonth)
              if (monthBlock && monthBlock.weeks.length > 0) {
                console.log(
                  `[setViewMode] Auto-selecting first week (${monthBlock.weeks[0]}) of month ${selectedMonth}`
                )
                // Automatically select the first week of the currently selected month
                set({ selectedWeek: monthBlock.weeks[0] })
              }
            }
          }
        }
      },
    }),
    // Persist configuration
    {
      name: "training-plan-storage", // Key used in localStorage
      // Specify which parts of the state to persist
      partialize: (state) => ({
        planMetadataList: state.planMetadataList, // Persist the list of plan summaries
        selectedWeek: state.selectedWeek,
        selectedMonth: state.selectedMonth,
        viewMode: state.viewMode,
        // Do NOT persist: activePlan (can be large), activePlanId (use localStorage directly), isLoading, error
      }),
    }
  )
)
