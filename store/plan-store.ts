import { TrainingPlanData, PlanMode, PlanMetadata } from "@/types/training-plan" // Assuming types are in types/training-plan
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { db } from "@/lib/db-client"
import { getPlanFromCache, cachePlan, hasPlanInCache, removePlanFromCache } from "./session-cache"
// Removed duplicate PlanMetadata import

// --- Helper: Create New Plan Template ---
const createNewPlanTemplate = (name = "New Training Plan"): TrainingPlanData => ({
  metadata: {
    planName: name,
    creationDate: new Date().toISOString(),
  },
  weekTypes: [],
  exerciseDefinitions: [],
  weeks: [],
  monthBlocks: [],
  sessionTypes: [],
  blocks: [],
})

// --- LocalStorage Keys ---
const DRAFT_MODE_KEY = "planStoreDraft_mode"
const DRAFT_PLAN_KEY = "planStoreDraft_plan"
const DRAFT_ORIGINAL_ID_KEY = "planStoreDraft_originalId"
const DRAFT_UNSAVED_KEY = "planStoreDraft_unsaved"

// --- State Interface ---
interface PlanState {
  // Core Data
  activePlan: TrainingPlanData | null
  activePlanId: string | null
  planMetadataList: PlanMetadata[]

  // Mode Management
  mode: PlanMode
  draftPlan: TrainingPlanData | null
  originalPlanId: string | null // ID of the plan being edited/viewed if not new
  hasUnsavedChanges: boolean

  // UI State
  isLoading: boolean
  error: string | null
  selectedWeek: number | null
  selectedMonth: number
  viewMode: "week" | "month"

  // --- Actions ---

  // Data Fetching & Metadata
  fetchPlanMetadata: (force?: boolean) => Promise<void>
  fetchPlanById: (
    planId: string
  ) => Promise<{ planData: TrainingPlanData; planName: string; createdAt: string } | null> // Adjusted return type

  // Plan Loading & Mode Setting
  loadPlanAndSetMode: (planId: string | null, editIntent: boolean) => Promise<void>
  startNewPlanEdit: () => Promise<void>
  startEditingPlan: (planId: string) => Promise<boolean> // New centralized function for edit logic

  // Active Plan Management
  _setActivePlanInternal: (plan: TrainingPlanData, planId: string) => void
  clearActivePlan: () => void
  clearActivePlanSelection: () => void

  // Draft/Mode Management
  _setModeState: (
    mode: PlanMode,
    draft: TrainingPlanData | null,
    originalId: string | null,
    unsaved: boolean
  ) => void
  updateDraftPlan: (updatedPlan: TrainingPlanData) => void
  exitMode: () => void // Simplified: only resets state
  discardDraftPlan: () => void // Calls exitMode

  // Saving
  saveDraftOrViewedPlan: () => Promise<string | null>
  _createPlanInternal: (planData: TrainingPlanData) => Promise<string | null> // Takes planData directly
  _updatePlanInternal: (planId: string, updatedPlan: TrainingPlanData) => Promise<boolean>
  removeLocalPlan: (planId: string) => Promise<boolean>

  // View Selection
  selectWeek: (weekNumber: number | null) => void
  selectMonth: (monthId: number) => void
  setViewMode: (mode: "week" | "month") => void

  // Initialization
  _initializeState: () => void

  // Helpers
  createNewPlanTemplate: (name?: string) => TrainingPlanData
}

// --- Store Implementation ---
export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      activePlan: null,
      activePlanId: null,
      planMetadataList: [],
      mode: "normal",
      draftPlan: null,
      originalPlanId: null,
      hasUnsavedChanges: false,
      isLoading: true, // Start as loading until initialized
      error: null,
      selectedWeek: null,
      selectedMonth: 1,
      viewMode: "month",

      createNewPlanTemplate: createNewPlanTemplate,

      // --- Initialization Action ---
      _initializeState: () => {
        console.log("[Store Init] Attempting to restore state...")
        if (typeof window === "undefined") {
          console.log("[Store Init] SSR environment, setting loading false.")
          set({ isLoading: false })
          return
        }
        try {
          const persistedMode = localStorage.getItem(DRAFT_MODE_KEY) as PlanMode | null
          const persistedPlanJson = localStorage.getItem(DRAFT_PLAN_KEY)
          const persistedOriginalId = localStorage.getItem(DRAFT_ORIGINAL_ID_KEY)
          const persistedUnsaved = localStorage.getItem(DRAFT_UNSAVED_KEY) === "true"

          if (persistedMode && persistedMode !== "normal" && persistedPlanJson) {
            const persistedPlan = JSON.parse(persistedPlanJson) as TrainingPlanData
            console.log("[Store Init] Restoring draft state:", {
              persistedMode,
              planName: persistedPlan?.metadata?.planName,
              persistedOriginalId,
              persistedUnsaved,
            })
            set({
              mode: persistedMode,
              draftPlan: persistedPlan,
              originalPlanId: persistedOriginalId,
              hasUnsavedChanges: persistedUnsaved,
            })
          } else {
            console.log("[Store Init] No draft state found.")
            // Ensure mode is normal if no draft
            set({ mode: "normal", draftPlan: null, originalPlanId: null, hasUnsavedChanges: false })
          }
        } catch (error) {
          console.error("[Store Init] Error reading draft state:", error)
          localStorage.removeItem(DRAFT_MODE_KEY)
          localStorage.removeItem(DRAFT_PLAN_KEY)
          localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
          localStorage.removeItem(DRAFT_UNSAVED_KEY)
          set({ mode: "normal", draftPlan: null, originalPlanId: null, hasUnsavedChanges: false })
        } finally {
          set({ isLoading: false }) // Mark loading as false after initialization attempt
        }
      },

      // --- Internal State Setter for Mode/Draft ---
      _setModeState: (mode, draft, originalId, unsaved) => {
        console.log(
          `[Store Internal] Setting mode: ${mode}, originalId: ${originalId}, unsaved: ${unsaved}`
        )

        set({
          mode: mode,
          draftPlan: draft,
          originalPlanId: originalId,
          hasUnsavedChanges: unsaved,
          error: null, // Clear errors on mode change
        })

        // Persist draft state manually (existing logic remains)
        if (typeof window === "undefined") return
        try {
          if (mode === "normal") {
            localStorage.removeItem(DRAFT_MODE_KEY)
            localStorage.removeItem(DRAFT_PLAN_KEY)
            localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
            localStorage.removeItem(DRAFT_UNSAVED_KEY)
          } else {
            localStorage.setItem(DRAFT_MODE_KEY, mode)
            if (draft) localStorage.setItem(DRAFT_PLAN_KEY, JSON.stringify(draft))
            else localStorage.removeItem(DRAFT_PLAN_KEY)
            if (originalId) localStorage.setItem(DRAFT_ORIGINAL_ID_KEY, originalId)
            else localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
            localStorage.setItem(DRAFT_UNSAVED_KEY, unsaved.toString())
          }
        } catch (e) {
          console.error("Failed to persist draft state:", e)
        }
      },

      // --- Data Fetching & Metadata ---
      fetchPlanMetadata: async (force = false) => {
        try {
          const currentMetadata = get().planMetadataList
          const isLoading = get().isLoading

          // Avoid fetching if already loading unless forced
          if (isLoading && !force) {
            console.log("[fetchPlanMetadata] Already loading, skipping fetch.")
            return
          }

          // Only fetch metadata if we're forcing a refresh or if the list is empty
          if (force || currentMetadata.length === 0) {
            console.log(
              `[fetchPlanMetadata] Fetching metadata. Reason: ${force ? "Forced" : "List empty"}.`
            )
            set({ isLoading: true, error: null })

            // Only fetch up-to-date information about plans that are ALREADY in our local store
            // If the list is empty, we don't fetch anything from the database
            if (currentMetadata.length > 0) {
              // Extract IDs of plans in our local store
              const localPlanIds = currentMetadata.map((plan) => plan.id)

              // Fetch up-to-date information only for plans we already know about
              const { data, error } = await db
                .from("training_plans")
                .select("id, planName:plan_data->metadata->planName, created_at, last_accessed_at")
                .in("id", localPlanIds)
                .order("created_at", { ascending: false })

              if (error) throw error

              // Map the data and filter out any plans that might no longer exist in the database
              const updatedPlanMetadata: PlanMetadata[] = (data ?? []).map((plan: any) => ({
                id: plan.id,
                name: plan.planName || "Unnamed Plan",
                createdAt: plan.created_at,
                updatedAt: plan.last_accessed_at || plan.created_at,
              }))

              console.log(
                `[fetchPlanMetadata] Updated ${updatedPlanMetadata.length} items out of ${localPlanIds.length} local plans.`
              )

              // If some plans were not found in the database, remove them from local store
              if (updatedPlanMetadata.length < localPlanIds.length) {
                const missingPlanIds = localPlanIds.filter(
                  (id) => !updatedPlanMetadata.some((plan) => plan.id === id)
                )
                console.log(
                  `[fetchPlanMetadata] ${missingPlanIds.length} plans not found in DB, removing from local store:`,
                  missingPlanIds
                )

                // Keep only plans that exist in the database
                set({ planMetadataList: updatedPlanMetadata, isLoading: false })
              } else {
                // All local plans still exist in the database
                set({ planMetadataList: updatedPlanMetadata, isLoading: false })
              }
            } else {
              // List is empty and we're not fetching from the database
              console.log(
                "[fetchPlanMetadata] Local plan list is empty. Not fetching from database."
              )
              set({ isLoading: false })
            }
          } else {
            console.log(
              `[fetchPlanMetadata] Metadata list exists (${currentMetadata.length} items) and not forced. Setting loading false.`
            )
            // Ensure loading is false if we skip the fetch
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
      fetchPlanById: async (planId) => {
        try {
          // 1. Validate Input ID
          if (!planId || typeof planId !== "string" || planId.toLowerCase() === "undefined") {
            console.error("[fetchPlanById] Called with invalid ID:", planId)
            return null
          }

          console.log(`[fetchPlanById] Fetching plan data for ID: ${planId}`)
          set({ isLoading: true, error: null })

          // 2. Check Session Cache
          if (hasPlanInCache(planId)) {
            console.log(`[fetchPlanById] Found plan ${planId} in session cache.`)
            const cachedPlan = getPlanFromCache(planId)
            set({ isLoading: false })

            if (cachedPlan) {
              console.log(`[fetchPlanById] Returning cached plan data structure for ${planId}`)
              return {
                planData: cachedPlan,
                planName: cachedPlan.metadata?.planName || "Cached Plan",
                createdAt: cachedPlan.metadata?.creationDate || new Date().toISOString(),
              }
            } else {
              console.error(`[fetchPlanById] Cache inconsistency for ${planId}. Fetching from DB.`)
            }
          }

          // 3. Fetch from Database
          console.log(`[fetchPlanById] Fetching ${planId} from database.`)
          const { data, error, status } = await db
            .from("training_plans")
            .select("plan_data, planName:plan_data->metadata->planName, created_at")
            .eq("id", planId)
            .single()

          // 4. Handle Database Errors
          if (error) {
            if (status === 406) {
              console.log(`[fetchPlanById] Plan ${planId} not found in database.`)
              const planExistsLocally = get().planMetadataList.some((plan) => plan.id === planId)
              if (planExistsLocally) {
                console.log(`[fetchPlanById] Removing stale local plan ${planId}.`)
                await get().removeLocalPlan(planId)
                set({
                  error: `Plan ${planId} no longer exists and removed locally.`,
                  isLoading: false,
                })
              } else {
                set({ error: `Plan ${planId} not found.`, isLoading: false })
              }
              return null
            } else {
              console.error("[fetchPlanById] Database fetch error:", error)
              set({ error: `Failed to fetch plan: ${error.message}`, isLoading: false })
              return null
            }
          }

          // 5. Process Successful Database Fetch
          if (data?.plan_data) {
            const fetchedPlanData = data.plan_data as TrainingPlanData
            cachePlan(planId, fetchedPlanData)
            console.log(`[fetchPlanById] Cached plan ${planId}.`)

            // Log access
            db.from("plan_access_log")
              .insert({ plan_id: planId })
              .then(({ error: logError }) => {
                if (logError)
                  console.error(`[fetchPlanById] Failed log access ${planId}:`, logError)
              })

            set({ isLoading: false })
            console.log(`[fetchPlanById] Returning DB fetched data for ${planId}`)
            return {
              planData: fetchedPlanData,
              planName: data.planName || "Unnamed Plan",
              createdAt: data.created_at || new Date().toISOString(),
            }
          }

          // 6. Handle No Data Case
          console.log(`[fetchPlanById] No plan_data found for ${planId}.`)
          set({ isLoading: false, error: `No plan data found for ID ${planId}.` })
          return null
        } catch (err) {
          // 7. Catch Unhandled Errors
          console.error("[fetchPlanById] Unexpected error:", err)
          set({
            error: err instanceof Error ? err.message : "Unknown error fetching plan",
            isLoading: false,
          })
          return null
        }
      },

      // --- Plan Loading & Mode Setting ---
      loadPlanAndSetMode: async (planId, editIntent) => {
        console.log(
          `[Store Action] loadPlanAndSetMode called. planId: ${planId}, editIntent: ${editIntent}`
        )
        set({ isLoading: true, error: null })

        try {
          // Handle New Plan Intent
          if (planId === null && editIntent) {
            await get().startNewPlanEdit()
            return
          }

          if (!planId) throw new Error("Invalid request: Plan ID is missing.")

          let effectiveEditIntent = editIntent
          let planDataToUse: TrainingPlanData | null = null
          let usePersistedDraft = false
          let persistedUnsaved = false

          // Check for existing draft for THIS planId
          if (typeof window !== "undefined") {
            const persistedDraftMode = localStorage.getItem(DRAFT_MODE_KEY)
            const persistedDraftOriginalId = localStorage.getItem(DRAFT_ORIGINAL_ID_KEY)
            const persistedDraftPlanJson = localStorage.getItem(DRAFT_PLAN_KEY)

            if (
              persistedDraftMode === "edit" &&
              persistedDraftOriginalId === planId &&
              persistedDraftPlanJson
            ) {
              console.log(`[Store Action] Found existing draft for ${planId}.`)
              try {
                planDataToUse = JSON.parse(persistedDraftPlanJson)
                persistedUnsaved = localStorage.getItem(DRAFT_UNSAVED_KEY) === "true"
                usePersistedDraft = true
                effectiveEditIntent = true // Force edit mode
              } catch (e) {
                console.error("[Store Action] Error parsing draft, fetching fresh.", e)
                planDataToUse = null
                usePersistedDraft = false
                effectiveEditIntent = true
              }
            }
          }

          // Fetch plan data if not using persisted draft
          if (!usePersistedDraft) {
            const fetchResult = await get().fetchPlanById(planId)
            if (fetchResult?.planData) {
              planDataToUse = fetchResult.planData
              console.log(`[Store Action] Fetched plan ${planId}.`)
            } else {
              console.error(`[Store Action] Plan ${planId} not found or fetch failed.`)
              if (!get().error) {
                set({ error: `Plan ${planId} not found.`, isLoading: false })
              }
              return
            }
          }

          if (!planDataToUse) {
            throw new Error(`Failed to load plan data for ${planId}`)
          }

          const currentState = get()
          const isOwned = currentState.planMetadataList.some((p) => p.id === planId)

          // Conflict Check
          if (
            effectiveEditIntent &&
            currentState.mode === "edit" &&
            currentState.hasUnsavedChanges &&
            currentState.originalPlanId !== null &&
            currentState.originalPlanId !== planId
          ) {
            console.warn(
              `[Store Action] Edit conflict: Unsaved changes for ${currentState.originalPlanId}.`
            )
            set({ error: `EDIT_CONFLICT:${planId}`, isLoading: false })
            return
          }

          // Set the appropriate mode
          if (effectiveEditIntent) {
            console.log(`[Store Action] Entering edit mode for ${planId}.`)
            get()._setModeState(
              "edit",
              planDataToUse,
              planId,
              usePersistedDraft ? persistedUnsaved : false
            )
          } else {
            if (currentState.mode !== "normal") {
              get().exitMode()
            }
            if (isOwned) {
              console.log(`[Store Action] Setting active plan ${planId}.`)
              get()._setActivePlanInternal(planDataToUse, planId)
            } else {
              console.log(`[Store Action] Entering view mode for ${planId}.`)
              get()._setModeState("view", planDataToUse, planId, false)
            }
          }
        } catch (err) {
          console.error(`[Store Action] Error in loadPlanAndSetMode for ${planId}:`, err)
          set({ error: err instanceof Error ? err.message : "Failed to load plan" })
        } finally {
          if (get().isLoading) {
            set({ isLoading: false })
          }
        }
      },

      startNewPlanEdit: async () => {
        console.log("[Store Action] startNewPlanEdit called.")
        const newPlanTemplate = get().createNewPlanTemplate()
        get()._setModeState("edit", newPlanTemplate, null, true)
        set({ selectedWeek: null, selectedMonth: 1, viewMode: "month", isLoading: false })
      },
      // Centralized function to trigger edit mode for a specific plan
      startEditingPlan: async (planId) => {
        console.log(`[Store Action] startEditingPlan called for planId: ${planId}`)
        if (!planId) {
          console.error("[Store Action] startEditingPlan called with invalid planId")
          set({ error: "Invalid plan ID for editing" })
          return false
        }

        const currentState = get()
        
        // Check for edit conflicts with other plans
        if (
          currentState.mode === "edit" &&
          currentState.hasUnsavedChanges &&
          currentState.originalPlanId !== null &&
          currentState.originalPlanId !== planId
        ) {
          console.warn(
            `[Store Action] Edit conflict detected: Already editing ${currentState.originalPlanId} with unsaved changes`
          )
          set({ error: `EDIT_CONFLICT:${planId}` })
          return false
        }
        
        try {
          // If we're already editing the requested plan, just return success
          if (
            currentState.mode === "edit" && 
            currentState.originalPlanId === planId
          ) {
            console.log(`[Store Action] Already editing plan ${planId}, skipping reload`)
            return true
          }
          
          // Use the existing loadPlanAndSetMode with editIntent=true
          await get().loadPlanAndSetMode(planId, true)
          
          // Check if the operation was successful
          const updatedState = get()
          const success = 
            updatedState.mode === "edit" && 
            updatedState.originalPlanId === planId &&
            !updatedState.error
            
          return success
        } catch (err) {
          console.error(`[Store Action] Error in startEditingPlan for ${planId}:`, err)
          set({ 
            error: err instanceof Error ? err.message : "Failed to start editing plan",
            isLoading: false
          })
          return false
        }
      },

      // --- Active Plan Management ---
      _setActivePlanInternal: (plan, planId) => {
        console.log(`[Store Internal] Setting active plan: ${planId}`)
        if (typeof window !== "undefined") localStorage.setItem("lastViewedPlanId", planId)
        const currentMetadataList = get().planMetadataList
        const now = new Date().toISOString()
        const planName = plan.metadata?.planName || "Unnamed Plan" // Get name from plan data
        const createdAt = plan.metadata?.creationDate || now // Get creation date or use now

        const metadataExists = currentMetadataList.some((p) => p.id === planId)
        let nextMetadataList = metadataExists
          ? currentMetadataList.map((meta) =>
              meta.id === planId
                ? { ...meta, name: planName, updatedAt: now } // Update name and timestamp
                : meta
            )
          : [
              ...currentMetadataList,
              {
                id: planId,
                name: planName, // Use name from plan data
                createdAt: createdAt, // Use creation date from plan data or now
                updatedAt: now,
              },
            ]
        nextMetadataList.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        const firstMonthId = plan?.monthBlocks?.[0]?.id ?? 1
        const firstWeekInPlan =
          plan?.weeks?.sort((a, b) => a.weekNumber - b.weekNumber)[0]?.weekNumber ?? null

        set({
          activePlan: plan,
          activePlanId: planId,
          planMetadataList: nextMetadataList,
          mode: "normal",
          draftPlan: null,
          originalPlanId: null,
          hasUnsavedChanges: false,
          error: null,
          selectedMonth: firstMonthId,
          selectedWeek: firstWeekInPlan,
          viewMode: firstWeekInPlan !== null ? "week" : "month",
          isLoading: false,
        })

        if (typeof window !== "undefined") {
          try {
            console.log("[Store Internal _setActivePlanInternal] Clearing draft keys.")
            localStorage.removeItem(DRAFT_MODE_KEY)
            localStorage.removeItem(DRAFT_PLAN_KEY)
            localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
            localStorage.removeItem(DRAFT_UNSAVED_KEY)
          } catch (e) {
            console.error("Failed to clear draft state:", e)
          }
        }
      },
      clearActivePlan: () => {
        console.log("[Store Action] clearActivePlan called.")
        if (typeof window !== "undefined") localStorage.removeItem("lastViewedPlanId")
        get().exitMode()
        set({ activePlan: null, activePlanId: null })
      },
      clearActivePlanSelection: () => {
        console.log("[Store Action] clearActivePlanSelection called.")
        if (typeof window !== "undefined") localStorage.removeItem("lastViewedPlanId")
        set({
          activePlan: null,
          activePlanId: null,
          selectedMonth: 1,
          selectedWeek: null,
          viewMode: "month",
        })
      },

      // --- Draft/Mode Management ---
      updateDraftPlan: (updatedPlan) => {
        console.log("[Store Action] updateDraftPlan called.")
        if (get().mode === "edit") {
          get()._setModeState("edit", updatedPlan, get().originalPlanId, true)
        } else {
          console.warn("[Store Action] updateDraftPlan called when not in edit mode.")
        }
      },
      exitMode: () => {
        console.log("[Store Action] exitMode called.")
        const currentState = get()
        if (currentState.mode !== "normal") {
          currentState._setModeState("normal", null, null, false)
        }
        const activePlanForViewReset = get().activePlan
        const firstMonthId = activePlanForViewReset?.monthBlocks?.[0]?.id ?? 1
        const firstWeek =
          activePlanForViewReset?.weeks?.sort((a, b) => a.weekNumber - b.weekNumber)[0]
            ?.weekNumber ?? null
        set({
          selectedMonth: firstMonthId,
          selectedWeek: firstWeek,
          viewMode: firstWeek !== null ? "week" : "month",
          isLoading: false,
          error: null,
        })
      },
      discardDraftPlan: () => {
        console.log("[Store Action] discardDraftPlan called.")
        get().exitMode()
      },

      // --- Saving ---
      saveDraftOrViewedPlan: async () => {
        console.log("[Store Action] saveDraftOrViewedPlan called.")
        const {
          mode,
          draftPlan,
          originalPlanId,
          _createPlanInternal,
          _updatePlanInternal,
          _setActivePlanInternal,
          activePlanId,
        } = get()

        if (!draftPlan) {
          set({ error: "No plan data to save." })
          return null
        }

        if (mode === "normal") {
          console.log("[Store Action] Already in normal mode, no save needed.")
          return activePlanId
        }

        set({ isLoading: true, error: null })

        try {
          let savedPlanId: string | null = null
          let success = false

          // Ensure metadata is present and valid before saving
          const planToSave = {
            ...draftPlan,
            metadata: {
              ...(draftPlan.metadata || {}),
              planName:
                draftPlan.metadata?.planName || (originalPlanId ? "Updated Plan" : "New Plan"),
              creationDate: draftPlan.metadata?.creationDate || new Date().toISOString(),
            },
          }

          if (mode === "view" && originalPlanId) {
            // Save viewed plan locally by setting it active
            console.log(`[Store Action] Saving viewed plan ${originalPlanId} locally.`)
            _setActivePlanInternal(planToSave, originalPlanId)
            savedPlanId = originalPlanId
            success = true
            console.log(`[Store Action] Activated viewed plan ${savedPlanId}.`)
          } else if (mode === "edit") {
            // Save edited plan to DB
            // Plans are immutable, so we always create a new plan
            console.log(`[Store Action] Creating new plan in DB (immutable design).`)
            
            // Always create a new plan with the same name (immutable design)
            savedPlanId = await _createPlanInternal(planToSave)
            success = savedPlanId !== null

            if (success && savedPlanId) {
              console.log(`[Store Action] DB op successful for ${savedPlanId}. Setting active.`)
              _setActivePlanInternal(planToSave, savedPlanId)
            } else {
              throw new Error(`Failed to ${originalPlanId ? "update" : "create"} plan in DB.`)
            }
          } else {
            throw new Error(`Cannot save in mode: ${mode}`)
          }

          return savedPlanId
        } catch (err) {
          console.error("[Store Action] Error in saveDraftOrViewedPlan:", err)
          set({
            error: err instanceof Error ? err.message : "Failed to save plan",
            isLoading: false,
          })
          return null
        } finally {
          if (get().isLoading) {
            set({ isLoading: false })
          }
        }
      },

      // Takes the full planData object directly
      _createPlanInternal: async (planData) => {
        try {
          // Ensure metadata exists (should be handled by saveDraftOrViewedPlan)
          if (!planData.metadata?.planName) {
            throw new Error("Cannot create plan: Plan name is missing in metadata.")
          }
          if (!planData.metadata?.creationDate) {
            planData.metadata.creationDate = new Date().toISOString()
          }

          console.log(
            `[Store Internal] Creating plan in DB with name: ${planData.metadata.planName}`
          )
          const { data, error } = await db
            .from("training_plans")
            .insert({ plan_data: planData }) // Insert the whole object
            .select("id, created_at")
            .single()

          if (error) throw error
          if (!data) throw new Error("No data returned after insert.")

          // Update metadata list locally
          const newPlanMetadata: PlanMetadata = {
            id: data.id,
            name: planData.metadata.planName, // Use name from the inserted data
            createdAt: data.created_at,
            updatedAt: data.created_at,
          }
          const currentMetadata = get().planMetadataList
          const updatedList = [...currentMetadata, newPlanMetadata].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          set({ planMetadataList: updatedList })
          return data.id
        } catch (err) {
          console.error("Error in _createPlanInternal:", err)
          set({ error: err instanceof Error ? err.message : "Unknown error creating plan" })
          return null
        }
      },
      _updatePlanInternal: async (planId, updatedPlan) => {
        try {
          if (!updatedPlan.metadata?.planName) {
            throw new Error("Update failed: Plan name is missing in metadata.")
          }
          const now = new Date().toISOString()
          console.log(
            `[Store Internal] Updating plan ${planId} in DB with name: ${updatedPlan.metadata.planName}`
          )
          const { error } = await db
            .from("training_plans")
            .update({ plan_data: updatedPlan, last_accessed_at: now })
            .eq("id", planId)

          if (error) throw error

          // Update metadata list locally
          const currentMetadata = get().planMetadataList
          const updatedList = currentMetadata.map((meta) =>
            meta.id === planId
              ? { ...meta, name: updatedPlan.metadata!.planName, updatedAt: now } // Use name from updated data
              : meta
          )
          updatedList.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          set({ planMetadataList: updatedList })

          // Update active plan data if it's the one being edited
          if (get().activePlanId === planId) {
            set({ activePlan: updatedPlan })
          }
          return true
        } catch (err) {
          console.error("Error in _updatePlanInternal:", err)
          set({ error: err instanceof Error ? err.message : "Unknown error updating plan" })
          return false
        }
      },
      removeLocalPlan: async (planId) => {
        console.log(`[removeLocalPlan] START - Removing plan ID: ${planId}`)
        const state = get()
        let wasActive = state.activePlanId === planId
        let wasBeingEdited = state.mode === "edit" && state.originalPlanId === planId
        try {
          // Remove from session cache
          removePlanFromCache(planId)
          console.log(`[removeLocalPlan] Removed plan ${planId} from session cache.`)

          // Update local state
          const listAfterFilter = state.planMetadataList.filter((p) => p.id !== planId)
          let stateUpdate: Partial<PlanState> = { planMetadataList: listAfterFilter, error: null }

          if (wasActive || wasBeingEdited) {
            console.log(`[removeLocalPlan] Plan ${planId} was active/edited. Clearing state.`)
            if (typeof window !== "undefined") localStorage.removeItem("lastViewedPlanId")
            get().exitMode()
            stateUpdate = { ...stateUpdate, ...get() } // Merge results from exitMode
          } else {
            console.log(`[removeLocalPlan] Plan ${planId} was not active/edited.`)
          }
          set(stateUpdate)
          console.log(`[removeLocalPlan] END - State set. Returning true.`)
          return true
        } catch (err) {
          console.error("[removeLocalPlan] Error:", err)
          set({ error: err instanceof Error ? err.message : "Unknown error removing plan" })
          return false
        }
      },

      // --- View Selection ---
      selectWeek: (weekNumber) => {
        if (
          get().selectedWeek !== weekNumber ||
          (weekNumber !== null && get().viewMode !== "week")
        ) {
          set({ selectedWeek: weekNumber })
          if (weekNumber !== null) {
            set({ viewMode: "week" })
            const plan = get().mode === "normal" ? get().activePlan : get().draftPlan
            if (plan?.monthBlocks) {
              const month = plan.monthBlocks.find((m) => m.weeks?.includes(weekNumber))
              if (month && get().selectedMonth !== month.id) set({ selectedMonth: month.id })
            }
          }
        }
      },
      selectMonth: (monthId) => {
        if (get().selectedMonth !== monthId) {
          set({ selectedMonth: monthId, selectedWeek: null, viewMode: "month" })
        }
      },
      setViewMode: (mode) => {
        if (get().viewMode !== mode) {
          set({ viewMode: mode })
          if (mode === "month") {
            set({ selectedWeek: null })
          } else if (mode === "week" && get().selectedWeek === null) {
            const plan = get().mode === "normal" ? get().activePlan : get().draftPlan
            const currentMonthId = get().selectedMonth
            const month = plan?.monthBlocks?.find((m) => m.id === currentMonthId)
            const firstWeekInMonth = month?.weeks?.[0]
            if (firstWeekInMonth !== undefined && firstWeekInMonth !== null) {
              set({ selectedWeek: firstWeekInMonth })
            } else {
              const firstPlanWeek = plan?.weeks?.sort((a, b) => a.weekNumber - b.weekNumber)[0]
                ?.weekNumber
              if (firstPlanWeek !== undefined && firstPlanWeek !== null) {
                set({ selectedWeek: firstPlanWeek })
                const firstPlanMonth = plan?.monthBlocks?.find((m) =>
                  m.weeks?.includes(firstPlanWeek)
                )
                if (firstPlanMonth) set({ selectedMonth: firstPlanMonth.id })
              }
            }
          }
        }
      },
    }),
    {
      name: "training-plan-storage-v2",
      partialize: (state) => ({
        activePlanId: state.activePlanId,
        planMetadataList: state.planMetadataList,
        selectedWeek: state.selectedWeek,
        selectedMonth: state.selectedMonth,
        viewMode: state.viewMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof window === "undefined") return
        if (state) {
          console.log("[Store Rehydrate] Rehydrated state, initializing draft state.")
          state._initializeState()
          console.log("[Store Rehydrate] Using persisted plan metadata.")
          if (state.isLoading) {
            state.isLoading = false
          }
        } else {
          console.warn("[Store Rehydrate] No state found during rehydration.")
        }
      },
    }
  )
)

// --- Selector for Display List ---
export const selectSortedPlanMetadata = (state: PlanState): PlanMetadata[] => {
  const now = Date.now()
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000
  const recentPlans: PlanMetadata[] = []
  const olderPlans: PlanMetadata[] = []
  const metadataList = Array.isArray(state.planMetadataList) ? state.planMetadataList : []

  metadataList.forEach((plan) => {
    try {
      const updatedAtTime =
        plan.updatedAt && typeof plan.updatedAt === "string"
          ? new Date(plan.updatedAt).getTime()
          : 0

      if (isNaN(updatedAtTime)) {
        console.warn(`Invalid updatedAt date for plan ${plan.id}: ${plan.updatedAt}`)
        olderPlans.push(plan)
      } else if (updatedAtTime >= twentyFourHoursAgo) {
        recentPlans.push(plan)
      } else {
        olderPlans.push(plan)
      }
    } catch (e) {
      console.warn(`Error processing date for plan ${plan.id}:`, e)
      olderPlans.push(plan)
    }
  })

  recentPlans.sort((a, b) => {
    const dateA =
      a.updatedAt && typeof a.updatedAt === "string" ? new Date(a.updatedAt).getTime() : 0
    const dateB =
      b.updatedAt && typeof b.updatedAt === "string" ? new Date(b.updatedAt).getTime() : 0
    return dateB - dateA
  })

  olderPlans.sort((a, b) => {
    const dateA =
      a.createdAt && typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0
    const dateB =
      b.createdAt && typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA
  })

  return [...recentPlans, ...olderPlans]
}
