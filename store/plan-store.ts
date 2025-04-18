// store/plan-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { TrainingPlanData } from "@/types/training-plan" // Adjust path as needed
import { supabase } from "@/lib/supa-client" // Adjust path as needed

// Type for plan metadata (remains the same)
export interface PlanMetadata {
  id: string
  name: string
  createdAt: string // ISO String Date
  updatedAt: string // ISO String Date (Represents last accessed/modified)
}

// Define the expanded state structure (remains the same)
interface PlanState {
  activePlan: TrainingPlanData | null
  activePlanId: string | null
  planMetadataList: PlanMetadata[] // This will be the base list, sorted by createdAt
  isLoading: boolean
  error: string | null
  selectedWeek: number | null
  selectedMonth: number
  viewMode: "week" | "month"
  setActivePlan: (plan: TrainingPlanData, planId: string) => void
  clearActivePlan: () => void
  fetchPlanMetadata: (force?: boolean) => Promise<void>
  createPlan: (name: string, planData: TrainingPlanData) => Promise<string | null>
  createPlanFromEdit: (
    originalId: string,
    updatedPlan: TrainingPlanData,
    newName?: string
  ) => Promise<string | null>
  updatePlan: (planId: string, updatedPlan: TrainingPlanData) => Promise<boolean>
  savePlan: (plan: TrainingPlanData, name?: string) => Promise<string | null>
  savePlanFromExternal: (plan: TrainingPlanData, name?: string) => Promise<string | null>
  removeLocalPlan: (planId: string) => Promise<boolean>
  selectWeek: (weekNumber: number | null) => void
  selectMonth: (monthId: number) => void
  setViewMode: (mode: "week" | "month") => void
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      // Initial state (same as before)
      activePlan: null,
      activePlanId: null,
      planMetadataList: [],
      isLoading: false,
      error: null,
      selectedWeek: null,
      selectedMonth: 1,
      viewMode: "month",

      // --- Actions ---

      setActivePlan: (plan, planId) => {
        console.log(
          `[setActivePlan] Setting active plan: ${plan?.metadata?.planName || "Unknown"} (ID: ${planId})`
        )
        const previousActivePlanId = get().activePlanId
        localStorage.setItem("lastViewedPlanId", planId)

        const currentMetadataList = get().planMetadataList
        const metadataExists = currentMetadataList.some((p) => p.id === planId)

        let nextMetadataList = [...currentMetadataList] // Start with a copy

        if (!metadataExists && plan?.metadata) {
          console.warn(`[setActivePlan] Metadata for active plan ID ${planId} not found. Adding.`)
          const newPlanMetadata: PlanMetadata = {
            id: planId,
            name: plan.metadata.planName || "Unnamed Plan",
            createdAt: plan.metadata.creationDate || new Date().toISOString(),
            updatedAt: new Date().toISOString(), // Set initial updatedAt
          }
          nextMetadataList.push(newPlanMetadata)
          // Sort by createdAt descending after adding
          nextMetadataList.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        } else if (metadataExists) {
          console.log(`[setActivePlan] Updating last accessed timestamp for plan ID ${planId}.`)
          // *** MODIFIED: Update timestamp in place, NO REORDERING of the base list ***
          nextMetadataList = currentMetadataList.map((meta) =>
            meta.id === planId
              ? {
                  ...meta,
                  name: plan?.metadata?.planName || meta.name, // Update name if changed
                  updatedAt: new Date().toISOString(), // Update timestamp
                }
              : meta
          )
          // The list remains sorted by createdAt
        } else {
          console.warn(
            `[setActivePlan] Metadata for plan ID ${planId} not found, and plan object or its metadata field is missing.`
          )
          // nextMetadataList remains unchanged
        }

        // Set state with potentially updated metadata (timestamp/name changed, or new item added)
        // but maintain the base sorting (e.g., by createdAt)
        set({
          activePlan: plan,
          activePlanId: planId,
          planMetadataList: nextMetadataList,
          error: null,
        })

        // Reset view state if the active plan ID changed (logic remains the same)
        if (previousActivePlanId !== planId) {
          // ... (view state reset logic as before) ...
          const firstMonthId = plan?.monthBlocks?.[0]?.id ?? 1
          const hasWeeks = Boolean(plan?.weeks?.length)
          const firstWeek = hasWeeks ? plan?.weeks[0]?.weekNumber : null
          if (hasWeeks && firstWeek !== null) {
            set({ selectedMonth: firstMonthId, selectedWeek: firstWeek, viewMode: "week" })
          } else {
            set({ selectedMonth: firstMonthId, selectedWeek: null, viewMode: "month" })
          }
        } else {
          // Ensure name is up-to-date in metadata list even if ID is same
          const nameUpdatedList = nextMetadataList.map((meta) =>
            meta.id === planId ? { ...meta, name: plan?.metadata?.planName || meta.name } : meta
          )
          set({ planMetadataList: nameUpdatedList })
        }
      },

      fetchPlanMetadata: async (force = false) => {
        try {
          const currentMetadata = get().planMetadataList
          const isLoading = get().isLoading
          if (isLoading && !force) return

          if (force || currentMetadata.length === 0) {
            console.log(
              `[fetchPlanMetadata] Fetching from Supabase. Reason: ${force ? "Forced" : "List empty"}.`
            )
            set({ isLoading: true, error: null })

            // *** Fetch ordered by CREATED date descending ***
            const { data, error } = await supabase
              .from("training_plans")
              .select("id, planName:plan_data->metadata->planName, created_at, last_accessed_at")
              .order("created_at", { ascending: false }) // Default sort by creation date
              .limit(50)

            if (error) throw error

            const planMetadata: PlanMetadata[] = (data ?? []).map((plan: any) => ({
              id: plan.id,
              name: plan.planName || "Unnamed Plan",
              createdAt: plan.created_at,
              // Store the last access time if available, otherwise use created_at
              updatedAt: plan.last_accessed_at || plan.created_at,
            }))

            console.log(
              `[fetchPlanMetadata] Fetched ${planMetadata.length} items, sorted by creation date.`
            )
            set({ planMetadataList: planMetadata, isLoading: false })
          } else {
            console.log(
              `[fetchPlanMetadata] Metadata list exists (${currentMetadata.length} items) and not forced.`
            )
            set({ isLoading: false })
          }
        } catch (err) {
          console.error("Error fetching plan metadata:", err)
          set({
            error: err instanceof Error ? err.message : "Unknown error fetching plans",
            isLoading: false,
          })
        }
      },

      // Other actions remain the same, ensuring they sort by createdAt after adding
      createPlan: async (name, planData) => {
        /* ... implementation as before (ensure final set sorts list by createdAt) ... */
        try {
          set({ isLoading: true, error: null })
          if (!planData.metadata)
            planData.metadata = { planName: name, creationDate: new Date().toISOString() }
          else {
            planData.metadata.planName = name
            if (!planData.metadata.creationDate)
              planData.metadata.creationDate = new Date().toISOString()
          }
          const { data, error } = await supabase
            .from("training_plans")
            .insert({ plan_data: planData })
            .select("id, created_at")
            .single()
          if (error) throw error
          if (!data) throw new Error("No data returned after insert.")
          const newPlanMetadata: PlanMetadata = {
            id: data.id,
            name: planData.metadata?.planName || name,
            createdAt: data.created_at,
            updatedAt: data.created_at,
          }
          const currentMetadata = get().planMetadataList
          set({
            planMetadataList: [newPlanMetadata, ...currentMetadata].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
            isLoading: false,
          })
          return data.id
        } catch (err) {
          console.error("Error creating plan:", err)
          set({
            error: err instanceof Error ? err.message : "Unknown error creating plan",
            isLoading: false,
          })
          return null
        }
      },
      createPlanFromEdit: async (originalId, updatedPlan, newName) => {
        /* ... implementation as before (ensure final set sorts list by createdAt) ... */
        try {
          set({ isLoading: true, error: null })
          const planName = newName || `${updatedPlan.metadata?.planName || "Plan"} (Edited)`
          if (!updatedPlan.metadata)
            updatedPlan.metadata = { planName, creationDate: new Date().toISOString() }
          else {
            updatedPlan.metadata.planName = planName
            updatedPlan.metadata.creationDate = new Date().toISOString()
          }
          const { data, error } = await supabase
            .from("training_plans")
            .insert({ plan_data: updatedPlan })
            .select("id, created_at")
            .single()
          if (error) throw error
          if (!data) throw new Error("No data returned after insert.")
          const newPlanMetadata: PlanMetadata = {
            id: data.id,
            name: planName,
            createdAt: data.created_at,
            updatedAt: data.created_at,
          }
          const currentMetadata = get().planMetadataList
          set({
            planMetadataList: [newPlanMetadata, ...currentMetadata].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ),
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
      updatePlan: async (planId, updatedPlan) => {
        /* ... implementation as before (ensure final set sorts list by createdAt) ... */
        try {
          set({ isLoading: true, error: null })
          if (!updatedPlan.metadata) {
            set({ isLoading: false, error: "Plan metadata is missing" })
            return false
          }
          const now = new Date().toISOString()
          const { error } = await supabase
            .from("training_plans")
            .update({ plan_data: updatedPlan, last_accessed_at: now })
            .eq("id", planId)
          if (error) throw error
          const currentMetadata = get().planMetadataList
          const updatedList = currentMetadata
            .map((meta) =>
              meta.id === planId
                ? { ...meta, name: updatedPlan.metadata.planName || meta.name, updatedAt: now }
                : meta
            )
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          set({ planMetadataList: updatedList })
          if (get().activePlanId === planId) set({ activePlan: updatedPlan })
          set({ isLoading: false })
          return true
        } catch (err) {
          console.error("Error updating plan:", err)
          set({
            error: err instanceof Error ? err.message : "Unknown error updating plan",
            isLoading: false,
          })
          return false
        }
      },
      savePlan: async (plan, name) => {
        /* ... uses createPlan ... */
        try {
          set({ isLoading: true, error: null })
          const planToCreate = { ...plan }
          if (!planToCreate.metadata)
            planToCreate.metadata = {
              planName: name || "My Training Plan",
              creationDate: new Date().toISOString(),
            }
          else {
            planToCreate.metadata = {
              ...planToCreate.metadata,
              planName: name || planToCreate.metadata.planName || "My Training Plan",
              creationDate: planToCreate.metadata.creationDate || new Date().toISOString(),
            }
          }
          const planId = await get().createPlan(planToCreate.metadata.planName, planToCreate)
          set({ isLoading: false })
          return planId
        } catch (err) {
          console.error("Error in savePlan:", err)
          set({
            error: err instanceof Error ? err.message : "Unknown error saving plan",
            isLoading: false,
          })
          return null
        }
      },
      savePlanFromExternal: async (plan, name) => {
        /* ... uses createPlan ... */
        try {
          set({ isLoading: true, error: null })
          const planToSave = {
            ...plan,
            metadata: {
              ...(plan.metadata || {}),
              planName: name || `${plan.metadata?.planName || "Shared Plan"} (Copy)`,
              creationDate: new Date().toISOString(),
            },
          }
          const planId = await get().createPlan(planToSave.metadata.planName, planToSave)
          set({ isLoading: false })
          return planId
        } catch (err) {
          console.error("Error in savePlanFromExternal:", err)
          set({
            error: err instanceof Error ? err.message : "Unknown error saving external plan",
            isLoading: false,
          })
          return null
        }
      },
      removeLocalPlan: async (planId) => {
        /* ... implementation as before ... */
        console.log(`[removeLocalPlan] START - Removing plan ID: ${planId}`)
        const state = get()
        console.log(`[removeLocalPlan] Initial activePlanId: ${state.activePlanId}`)
        let wasActive = state.activePlanId === planId
        try {
          const listBeforeFilter = state.planMetadataList
          const listAfterFilter = listBeforeFilter.filter((p) => p.id !== planId)
          if (
            listAfterFilter.length === listBeforeFilter.length &&
            listBeforeFilter.some((p) => p.id === planId)
          ) {
            console.error(`[removeLocalPlan] FILTERING FAILED for ID ${planId}!`)
            set({ error: `Failed to locally remove plan ${planId}` })
            return false
          } else {
            console.log(`[removeLocalPlan] Filtering successful or plan ${planId} was not present.`)
          }
          if (wasActive) {
            console.log(`[removeLocalPlan] Plan ${planId} was active. Clearing active state.`)
            localStorage.removeItem("lastViewedPlanId")
            try {
              localStorage.removeItem("planModeDraft_mode")
              localStorage.removeItem("planModeDraft_plan")
              localStorage.removeItem("planModeDraft_originalId")
            } catch (error) {
              console.error(error)
            }
            set({
              activePlan: null,
              activePlanId: null,
              planMetadataList: listAfterFilter,
              selectedWeek: null,
              selectedMonth: 1,
              viewMode: "month",
              error: null,
            })
          } else {
            console.log(`[removeLocalPlan] Plan ${planId} was not active. Only updating list.`)
            set({ planMetadataList: listAfterFilter, error: null })
          }
          console.log(`[removeLocalPlan] END - State set. Returning true.`)
          return true
        } catch (err) {
          console.error("[removeLocalPlan] Error:", err)
          set({ error: err instanceof Error ? err.message : "Unknown error" })
          return false
        }
      },
      clearActivePlan: () => {
        /* ... implementation as before ... */
        console.log(
          `[clearActivePlan] START - Clearing active plan. Current ID: ${get().activePlanId}`
        )
        const currentId = get().activePlanId
        if (currentId) {
          localStorage.removeItem("lastViewedPlanId")
          try {
            localStorage.removeItem("planModeDraft_mode")
            localStorage.removeItem("planModeDraft_plan")
            localStorage.removeItem("planModeDraft_originalId")
          } catch (error) {
            console.error(error)
          }
        } else {
          console.log(`[clearActivePlan] No active plan ID found.`)
        }
        set({
          activePlan: null,
          activePlanId: null,
          selectedWeek: null,
          selectedMonth: 1,
          viewMode: "month",
          error: null,
        })
        console.log(`[clearActivePlan] END - State updated.`)
      },
      // View state actions (remain the same)
      selectWeek: (weekNumber) => {
        /* ... implementation as before ... */ if (
          get().selectedWeek !== weekNumber ||
          (weekNumber !== null && get().viewMode !== "week")
        ) {
          set({ selectedWeek: weekNumber })
          if (weekNumber !== null) {
            set({ viewMode: "week" })
            const p = get().activePlan
            if (p?.monthBlocks) {
              const mb = p.monthBlocks.find((b) => b.weeks.includes(weekNumber as number))
              if (mb && get().selectedMonth !== mb.id) {
                set({ selectedMonth: mb.id })
              }
            }
          }
        }
      },
      selectMonth: (monthId) => {
        /* ... implementation as before ... */ if (get().selectedMonth !== monthId) {
          set({ selectedMonth: monthId, selectedWeek: null, viewMode: "month" })
        }
      },
      setViewMode: (mode) => {
        /* ... implementation as before ... */ if (get().viewMode !== mode) {
          set({ viewMode: mode })
          if (mode === "month") {
            set({ selectedWeek: null })
          } else if (mode === "week" && get().selectedWeek === null) {
            const p = get().activePlan
            const sm = get().selectedMonth
            if (p?.monthBlocks) {
              const mb = p.monthBlocks.find((b) => b.id === sm)
              if (mb && mb.weeks.length > 0) {
                set({ selectedWeek: mb.weeks[0] })
              } else {
                const fw = p.weeks?.[0]?.weekNumber
                if (fw !== null && fw !== undefined) {
                  const fwmb = p.monthBlocks.find((b) => b.weeks.includes(fw))
                  set({ selectedWeek: fw, selectedMonth: fwmb?.id ?? sm })
                }
              }
            }
          }
        }
      },
    }),
    {
      name: "training-plan-storage",
      partialize: (state) => ({
        planMetadataList: state.planMetadataList,
        selectedWeek: state.selectedWeek,
        selectedMonth: state.selectedMonth,
        viewMode: state.viewMode,
      }),
    }
  )
)

// --- Selector for Display List ---
// This function should be used by components that need the sorted list
export const selectSortedPlanMetadata = (state: PlanState): PlanMetadata[] => {
  const now = Date.now()
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000 // Milliseconds in 24 hours

  const recentPlans: PlanMetadata[] = []
  const olderPlans: PlanMetadata[] = []

  state.planMetadataList.forEach((plan) => {
    const updatedAt = new Date(plan.updatedAt).getTime() // Use updatedAt timestamp
    if (updatedAt >= twentyFourHoursAgo) {
      recentPlans.push(plan)
    } else {
      olderPlans.push(plan)
    }
  })

  // Sort recent plans by updatedAt descending (most recent first)
  recentPlans.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  // Sort older plans by createdAt descending (newest created first) - assuming base list is already sorted like this
  // If not, uncomment the sort:
  // olderPlans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return [...recentPlans, ...olderPlans]
}
