import { TrainingPlanData } from "@/types/training-plan"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { db } from "@/lib/db-client"
import { getPlanFromCache, cachePlan, hasPlanInCache, removePlanFromCache } from "./session-cache"
import { PlanMetadata } from "./plan-store" // Assuming PlanMetadata is exported

// --- Types --- (Keep existing types: PlanMetadata, PlanMode)

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
  fetchPlanById: (planId: string) => Promise<TrainingPlanData | null>

  // Plan Loading & Mode Setting
  loadPlanAndSetMode: (planId: string | null, editIntent: boolean) => Promise<void>
  startNewPlanEdit: () => Promise<void>

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
  _createPlanInternal: (name: string, planData: TrainingPlanData) => Promise<string | null>
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
        // *** REMOVED Metadata List Update Logic ***
        // let updatedMetadataList = get().planMetadataList
        // if (mode === 'view' && originalId && draft) { ... } -> REMOVED

        set({
          mode: mode,
          draftPlan: draft,
          originalPlanId: originalId,
          hasUnsavedChanges: unsaved,
          // planMetadataList: updatedMetadataList, // REMOVED - Don't update list here
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
            // Return null for invalid ID, caller should handle.
            return null
          }

          console.log(`[fetchPlanById] Fetching plan data for ID: ${planId}`)
          set({ isLoading: true, error: null }) // Set loading true

          // 2. Check Session Cache
          if (hasPlanInCache(planId)) {
            console.log(`[fetchPlanById] Found plan ${planId} in session cache. Using cached data.`)
            const cachedPlan = getPlanFromCache(planId)
            set({ isLoading: false }) // Set loading false after cache check

            if (cachedPlan) {
              // Construct the consistent return object from cached data
              console.log(`[fetchPlanById] Returning cached plan data structure for ${planId}`)
              return {
                planData: cachedPlan,
                planName: cachedPlan.metadata?.planName || "Cached Plan",
                createdAt: cachedPlan.metadata?.creationDate || new Date().toISOString(),
              }
            } else {
              // Log cache inconsistency but proceed to DB fetch
              console.error(
                `[fetchPlanById] Cache inconsistency: hasPlanInCache true but getPlanFromCache null for ${planId}. Fetching from DB.`
              )
            }
          }

          // 3. Fetch from Database if not in cache or cache inconsistent
          console.log(
            `[fetchPlanById] Plan ${planId} not in session cache or cache failed. Fetching from database.`
          )
          const { data, error, status } = await db
            .from("training_plans")
            // Select required fields for the return object
            .select("plan_data, planName:plan_data->metadata->planName, created_at")
            .eq("id", planId)
            .single()

          // 4. Handle Database Errors
          if (error) {
            if (status === 406) {
              // 406 typically means 'Not Acceptable' often due to .single() finding 0 or >1 rows
              console.log(`[fetchPlanById] Plan with ID ${planId} not found in database.`)
              // Check if it existed locally *before* failing DB fetch
              const planMetadataList = get().planMetadataList
              const planExistsLocally = planMetadataList.some((plan) => plan.id === planId)

              if (planExistsLocally) {
                console.log(
                  `[fetchPlanById] Plan ${planId} exists locally but not in DB. Removing from local store.`
                )
                await get().removeLocalPlan(planId) // Ensure removal is awaited
                set({
                  error: `Plan with ID ${planId} no longer exists and has been removed locally.`,
                  isLoading: false,
                })
              } else {
                // If it wasn't local and not in DB, just set error
                set({ error: `Plan with ID ${planId} not found.`, isLoading: false })
              }
              return null // Return null as plan not found
            } else {
              // Handle other DB errors
              console.error("[fetchPlanById] Database fetch error:", error)
              set({ error: `Failed to fetch plan: ${error.message}`, isLoading: false })
              return null
            }
          }

          // 5. Process Successful Database Fetch
          if (data?.plan_data) {
            const fetchedPlanData = data.plan_data as TrainingPlanData
            // Cache the fetched data
            cachePlan(planId, fetchedPlanData)
            console.log(`[fetchPlanById] Cached plan ${planId} in session memory.`)

            // Log access asynchronously
            db.from("plan_access_log")
              .insert({ plan_id: planId })
              .then(({ error: logError }) => {
                if (logError)
                  console.error(`[fetchPlanById] Failed to log access for ${planId}:`, logError)
              })

            set({ isLoading: false }) // Set loading false on success
            console.log(`[fetchPlanById] Returning DB fetched plan data structure for ${planId}`)
            // Construct and return the consistent object structure
            return {
              planData: fetchedPlanData,
              planName: data.planName || "Unnamed Plan", // Use fetched name or default
              createdAt: data.created_at || new Date().toISOString(), // Use fetched date or default
            }
          }

          // 6. Handle Case: No Data Returned from DB (Should be caught by 406, but as safety)
          console.log(`[fetchPlanById] No plan_data found in DB response for ${planId}.`)
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
        // No finally block needed for isLoading as it's handled in success/error paths now
      },

      // --- Plan Loading & Mode Setting ---
      loadPlanAndSetMode: async (planId, editIntent) => {
        console.log(
          `[Store Action] loadPlanAndSetMode called. planId: ${planId}, editIntent: ${editIntent}`
        )
        set({ isLoading: true, error: null }) // Start loading

        try {
          // --- Handle New Plan Intent ---
          if (planId === null && editIntent) {
            await get().startNewPlanEdit()
            // startNewPlanEdit sets isLoading to false
            return
          }

          // --- Validate Plan ID ---
          if (!planId) throw new Error("Invalid request: Plan ID is missing.")

          let effectiveEditIntent = editIntent
          let planDataToUse: TrainingPlanData | null = null
          // Removed fetchedPlanName and fetchedCreatedAt - not needed here anymore
          let usePersistedDraft = false
          let persistedUnsaved = false

          // --- Check for existing draft for THIS planId ---
          if (typeof window !== "undefined") {
            const persistedDraftMode = localStorage.getItem(DRAFT_MODE_KEY)
            const persistedDraftOriginalId = localStorage.getItem(DRAFT_ORIGINAL_ID_KEY)
            const persistedDraftPlanJson = localStorage.getItem(DRAFT_PLAN_KEY)

            if (
              persistedDraftMode === "edit" &&
              persistedDraftOriginalId === planId &&
              persistedDraftPlanJson
            ) {
              console.log(
                `[Store Action] Found existing draft for target plan ${planId}. Will use draft.`
              )
              try {
                planDataToUse = JSON.parse(persistedDraftPlanJson)
                persistedUnsaved = localStorage.getItem(DRAFT_UNSAVED_KEY) === "true"
                usePersistedDraft = true
                effectiveEditIntent = true // Force edit mode if draft exists
              } catch (e) {
                console.error(
                  "[Store Action] Error parsing persisted draft plan, fetching fresh.",
                  e
                )
                planDataToUse = null // Ensure we fetch fresh data
                usePersistedDraft = false
                effectiveEditIntent = true // Still force edit
              }
            }
          }

          // --- Fetch plan data if not using persisted draft ---
          if (!usePersistedDraft) {
            // *** MODIFICATION START ***
            // Call fetchPlanById - it now returns { planData, planName, createdAt } or null
            const fetchResult = await get().fetchPlanById(planId)

            // Check if fetchResult is valid and extract planData
            if (fetchResult && typeof fetchResult === "object" && "planData" in fetchResult) {
              planDataToUse = fetchResult.planData as TrainingPlanData // <-- Extract the actual plan data
              console.log(
                `[Store Action] Successfully fetched plan ${planId}. Name: ${fetchResult.planName}`
              )
            } else {
              // Handle case where plan is not found or fetch failed (fetchPlanById returns null or unexpected)
              console.error(`[Store Action] Plan ${planId} not found or fetch failed.`)
              // Error should be set by fetchPlanById, but double-check
              if (!get().error) {
                set({
                  error: `Plan with ID ${planId} not found or could not be loaded.`,
                  isLoading: false,
                })
              }
              return // Stop execution
            }
            // *** MODIFICATION END ***
          }

          // If somehow planDataToUse is still null, something went wrong
          if (!planDataToUse) {
            // This path should ideally not be reached if the logic above is correct
            console.error(`[Store Action] Plan data for ${planId} became null unexpectedly.`)
            throw new Error(`Failed to load or resolve plan data for ID: ${planId}`)
          }

          const currentState = get()
          const isOwned = currentState.planMetadataList.some((p) => p.id === planId)

          // --- Conflict Check (Existing logic remains the same) ---
          if (
            effectiveEditIntent &&
            currentState.mode === "edit" &&
            currentState.hasUnsavedChanges &&
            currentState.originalPlanId !== null &&
            currentState.originalPlanId !== planId
          ) {
            console.warn(
              `[Store Action] Edit conflict: Trying to edit ${planId} while unsaved changes exist for ${currentState.originalPlanId}.`
            )
            set({
              error: `EDIT_CONFLICT:${planId}`,
              isLoading: false,
            })
            return
          }

          // --- Set the appropriate mode ---
          if (effectiveEditIntent) {
            console.log(
              `[Store Action] Entering edit mode for plan ${planId}. Using ${usePersistedDraft ? "persisted" : "fetched"} data.`
            )
            // *** Pass the correctly extracted planDataToUse ***
            get()._setModeState(
              "edit",
              planDataToUse, // Pass the actual TrainingPlanData
              planId,
              usePersistedDraft ? persistedUnsaved : false
            )
          } else {
            // Entering view or normal mode
            if (currentState.mode !== "normal") {
              get().exitMode() // Reset state fully before setting new active/view
            }
            if (isOwned) {
              console.log(`[Store Action] Setting active plan ${planId}.`)
              // *** Pass the correctly extracted planDataToUse ***
              get()._setActivePlanInternal(planDataToUse, planId) // Sets mode='normal'
            } else {
              console.log(`[Store Action] Entering view mode for plan ${planId}.`)
              // *** Pass the correctly extracted planDataToUse ***
              get()._setModeState("view", planDataToUse, planId, false)
            }
          }
        } catch (err) {
          console.error(`[Store Action] Error in loadPlanAndSetMode for ${planId}:`, err)
          set({ error: err instanceof Error ? err.message : "Failed to load plan" })
        } finally {
          // Ensure loading is always set to false at the end,
          // unless an error was set within fetchPlanById which already set it to false.
          if (get().isLoading) {
            set({ isLoading: false })
          }
        }
      },

      startNewPlanEdit: async () => {
        console.log("[Store Action] startNewPlanEdit called.")
        // Conflict check is handled by loadPlanAndSetMode via EDIT_CONFLICT error
        const newPlanTemplate = get().createNewPlanTemplate()
        get()._setModeState("edit", newPlanTemplate, null, true) // New plan starts unsaved
        set({ selectedWeek: null, selectedMonth: 1, viewMode: "month", isLoading: false })
      },

      // --- Active Plan Management ---
      _setActivePlanInternal: (plan, planId) => {
        console.log(`[Store Internal] Setting active plan: ${planId}`)
        if (typeof window !== "undefined") localStorage.setItem("lastViewedPlanId", planId)
        const currentMetadataList = get().planMetadataList
        const now = new Date().toISOString()
        const metadataExists = currentMetadataList.some((p) => p.id === planId)
        let nextMetadataList = metadataExists
          ? currentMetadataList.map((meta) =>
              meta.id === planId
                ? { ...meta, name: plan.metadata?.planName || meta.name, updatedAt: now }
                : meta
            )
          : [
              ...currentMetadataList,
              {
                id: planId,
                name: plan.metadata?.planName || "Unnamed Plan",
                createdAt: plan.metadata?.creationDate || now,
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
          mode: "normal", // Explicitly set mode to normal
          draftPlan: null,
          originalPlanId: null,
          hasUnsavedChanges: false,
          error: null,
          selectedMonth: firstMonthId,
          selectedWeek: firstWeekInPlan,
          viewMode: firstWeekInPlan !== null ? "week" : "month",
          isLoading: false,
        })

        // Ensure draft state is cleared from localStorage when successfully entering normal mode via save
        if (typeof window !== "undefined") {
          try {
            console.log(
              "[Store Internal _setActivePlanInternal] Clearing draft keys from localStorage."
            )
            localStorage.removeItem(DRAFT_MODE_KEY)
            localStorage.removeItem(DRAFT_PLAN_KEY)
            localStorage.removeItem(DRAFT_ORIGINAL_ID_KEY)
            localStorage.removeItem(DRAFT_UNSAVED_KEY)
          } catch (e) {
            console.error("Failed to clear draft state from localStorage:", e)
          }
        }
      },
      // This action clears BOTH active plan AND resets mode
      clearActivePlan: () => {
        console.log(
          "[Store Action] clearActivePlan called (clearing active plan AND exiting mode)."
        )
        if (typeof window !== "undefined") localStorage.removeItem("lastViewedPlanId")
        get().exitMode() // Reset mode/draft first
        set({ activePlan: null, activePlanId: null }) // Then clear active plan
        // View state reset is handled within exitMode now based on null activePlan
      },
      // *** NEW ACTION *** Only clears the active selection, leaves mode/draft intact
      clearActivePlanSelection: () => {
        console.log(
          "[Store Action] clearActivePlanSelection called (clearing only active plan ID/data)."
        )
        if (typeof window !== "undefined") localStorage.removeItem("lastViewedPlanId")
        set({
          activePlan: null,
          activePlanId: null,
          // Optionally reset view selections to default when no plan is active
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
      // Simplified: only resets state, navigation handled by caller
      exitMode: () => {
        console.log("[Store Action] exitMode called. Resetting mode/draft state to normal.")
        const currentState = get()
        if (currentState.mode !== "normal") {
          currentState._setModeState("normal", null, null, false) // Clear mode/draft/originalId/unsaved
        }
        // Reset view state based on the *active* plan (which might be null now if clearActivePlan was just called)
        const activePlanForViewReset = get().activePlan // Read the potentially null activePlan
        const firstMonthId = activePlanForViewReset?.monthBlocks?.[0]?.id ?? 1
        const firstWeek =
          activePlanForViewReset?.weeks?.sort((a, b) => a.weekNumber - b.weekNumber)[0]
            ?.weekNumber ?? null
        set({
          selectedMonth: firstMonthId,
          selectedWeek: firstWeek,
          viewMode: firstWeek !== null ? "week" : "month",
          isLoading: false, // Ensure loading is off
          error: null, // Ensure error is cleared
        })
      },
      // Calls simplified exitMode
      discardDraftPlan: () => {
        console.log("[Store Action] discardDraftPlan called.")
        get().exitMode()
      },

      // --- Saving --- (Keep existing logic, it seems okay)
      saveDraftOrViewedPlan: async () => {
        console.log("[Store Action] saveDraftOrViewedPlan called.")
        const {
          mode,
          draftPlan,
          originalPlanId,
          _createPlanInternal,
          _updatePlanInternal,
          _setActivePlanInternal, // Ensure this is destructured
          activePlanId, // Added to return if already normal
        } = get()

        if (!draftPlan) {
          set({ error: "No plan data to save." })
          return null
        }

        // If already in normal mode, do nothing (shouldn't be possible to call save, but safe check)
        if (mode === "normal") {
          console.log("[Store Action] Already in normal mode, no save needed.")
          return activePlanId // Return current active ID
        }

        set({ isLoading: true, error: null })

        try {
          let savedPlanId: string | null = null
          let success = false

          // *** Handle VIEW mode: Save locally only ***
          if (mode === "view" && originalPlanId) {
            console.log(`[Store Action] Saving viewed plan ${originalPlanId} locally.`)
            // Ensure metadata is present, provide defaults if not
            const planToSaveLocally = {
              ...draftPlan,
              metadata: {
                ...(draftPlan.metadata || {}),
                planName: draftPlan.metadata?.planName || "Saved Plan", // Use a default if missing
                creationDate: draftPlan.metadata?.creationDate || new Date().toISOString(),
              },
            }
            // Directly set the plan as active. This adds metadata locally and switches mode.
            _setActivePlanInternal(planToSaveLocally, originalPlanId)
            savedPlanId = originalPlanId // The ID is the one we were viewing
            success = true // Mark as successful local save/activation

            console.log(`[Store Action] Successfully activated viewed plan ${savedPlanId} locally.`)
          }
          // *** Handle EDIT mode: Save to Database ***
          else if (mode === "edit") {
            // Ensure metadata is present before DB save
            const planToSaveToDb = {
              ...draftPlan,
              metadata: {
                ...(draftPlan.metadata || {}),
                planName: draftPlan.metadata?.planName || "My Plan", // Use a default if missing
                creationDate: draftPlan.metadata?.creationDate || new Date().toISOString(),
              },
            }

            if (originalPlanId) {
              // Update existing plan in DB
              console.log(`[Store Action] Updating existing plan ${originalPlanId} in DB.`)
              success = await _updatePlanInternal(originalPlanId, planToSaveToDb)
              savedPlanId = success ? originalPlanId : null
            } else {
              // Create new plan in DB
              console.log(`[Store Action] Creating new plan in DB.`)
              const planName = planToSaveToDb.metadata.planName // Get potentially defaulted name
              savedPlanId = await _createPlanInternal(planName, planToSaveToDb)
              success = savedPlanId !== null
            }

            // If DB operation was successful, set the plan as active (which also resets mode)
            if (success && savedPlanId) {
              console.log(
                `[Store Action] DB operation successful for ${savedPlanId}. Setting active.`
              )
              // Pass the data that was actually saved to DB
              _setActivePlanInternal(planToSaveToDb, savedPlanId)
            } else {
              // Throw error if DB operation failed in edit mode
              throw new Error(`Failed to ${originalPlanId ? "update" : "create"} plan in database.`)
            }
          }
          // *** Handle unexpected modes ***
          else {
            console.warn(`[Store Action] saveDraftOrViewedPlan called in unexpected mode: ${mode}`)
            throw new Error(`Cannot save in mode: ${mode}`)
          }

          // Return the ID if save/local activation was successful
          return savedPlanId
        } catch (err) {
          console.error("[Store Action] Error in saveDraftOrViewedPlan:", err)
          set({
            error: err instanceof Error ? err.message : "Failed to save plan",
            isLoading: false, // Ensure loading is off on error
          })
          return null
        } finally {
          // isLoading is reset within _setActivePlanInternal or the catch block,
          // ensure it's off otherwise.
          if (get().isLoading) {
            set({ isLoading: false })
          }
        }
      },

      _createPlanInternal: async (name, planData) => {
        try {
          if (!planData.metadata)
            planData.metadata = { planName: name, creationDate: new Date().toISOString() }
          else {
            planData.metadata.planName = name
            if (!planData.metadata.creationDate)
              planData.metadata.creationDate = new Date().toISOString()
          }
          const { data, error } = await db
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
          if (!updatedPlan.metadata) throw new Error("Update failed: Plan metadata is missing.")
          const now = new Date().toISOString()
          const { error } = await db
            .from("training_plans")
            .update({ plan_data: updatedPlan, last_accessed_at: now })
            .eq("id", planId)
          if (error) throw error
          const currentMetadata = get().planMetadataList
          const updatedList = currentMetadata.map((meta) =>
            meta.id === planId
              ? { ...meta, name: updatedPlan.metadata!.planName || meta.name, updatedAt: now }
              : meta
          )
          updatedList.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          set({ planMetadataList: updatedList })
          if (get().activePlanId === planId) set({ activePlan: updatedPlan }) // Update activePlan if it's the one being edited
          return true
        } catch (err) {
          console.error("Error in _updatePlanInternal:", err)
          set({ error: err instanceof Error ? err.message : "Unknown error updating plan" })
          return false
        }
      },
      removeLocalPlan: async (planId) => {
        console.log(`[removeLocalPlan] START - Removing plan ID: ${planId} from local store only`)
        const state = get()
        let wasActive = state.activePlanId === planId
        let wasBeingEdited = state.mode === "edit" && state.originalPlanId === planId
        try {
          // Remove cached plan data from localStorage
          if (typeof window !== "undefined") {
            const cachedPlanKey = `planData_${planId}`
            try {
              localStorage.removeItem(cachedPlanKey)
              console.log(
                `[removeLocalPlan] Removed cached plan data for ${planId} from localStorage.`
              )
            } catch (err) {
              console.error(`[removeLocalPlan] Error removing cached plan data for ${planId}:`, err)
              // Non-critical error, continue even if removal fails
            }
          }

          // Remove from session cache as well
          try {
            removePlanFromCache(planId)
            console.log(`[removeLocalPlan] Removed plan ${planId} from session cache.`)
          } catch (err) {
            console.error(`[removeLocalPlan] Error removing plan from session cache:`, err)
            // Non-critical error, continue
          }

          // Update local state only - no Supabase deletion
          const listAfterFilter = state.planMetadataList.filter((p) => p.id !== planId)
          let stateUpdate: Partial<PlanState> = { planMetadataList: listAfterFilter, error: null }

          if (wasActive || wasBeingEdited) {
            console.log(
              `[removeLocalPlan] Plan ${planId} was active or being edited. Clearing active/draft state.`
            )
            if (typeof window !== "undefined") localStorage.removeItem("lastViewedPlanId")
            // Ensure we exit edit/view mode if the deleted plan was the target
            get().exitMode() // Resets mode to normal, clears draft etc.
            // exitMode already updates view state, merge its results
            stateUpdate = { ...stateUpdate, ...get() }
          } else {
            console.log(
              `[removeLocalPlan] Plan ${planId} was not active/edited. Only updating list.`
            )
          }
          set(stateUpdate)
          console.log(`[removeLocalPlan] END - State set. Returning true.`)
          return true
        } catch (err) {
          console.error("[removeLocalPlan] Error:", err)
          set({
            error:
              err instanceof Error ? err.message : "Unknown error removing plan from local store",
          })
          return false
        }
      },

      // --- View Selection --- (Keep existing logic)
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
      name: "training-plan-storage-v2", // Consider versioning if schema changes significantly
      partialize: (state) => ({
        // Only persist non-draft state here
        activePlanId: state.activePlanId,
        planMetadataList: state.planMetadataList,
        // Persist view state? Maybe - user might expect it.
        selectedWeek: state.selectedWeek,
        selectedMonth: state.selectedMonth,
        viewMode: state.viewMode,
      }),
      onRehydrateStorage: () => (state) => {
        // This runs AFTER Zustand has loaded its persisted state
        if (typeof window === "undefined") return // Prevent SSR execution
        if (state) {
          console.log("[Store Rehydrate] Rehydrated state, initializing draft state.")
          state._initializeState() // Try to load draft state from localStorage

          // Don't fetch metadata from the database on initialization
          // We'll use the persisted metadata that's already in the store
          console.log(
            "[Store Rehydrate] Using persisted plan metadata. Not fetching from database."
          )

          // Just ensure loading state is set to false
          if (state.isLoading) {
            state.isLoading = false
          }
        } else {
          console.warn("[Store Rehydrate] No state found during rehydration.")
        }
      },
      // Deprecated in Zustand v4, use onRehydrateStorage
      // version: 1, // Example versioning
      // migrate: (persistedState, version) => { ... migration logic ... }
    }
  )
)

// Initialize store after definition (run this once in your app, e.g., in layout)
// Removed immediate calls, rely on onRehydrateStorage or explicit call in layout/provider

// --- Selector for Display List ---
export const selectSortedPlanMetadata = (state: PlanState): PlanMetadata[] => {
  const now = Date.now()
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000
  const recentPlans: PlanMetadata[] = []
  const olderPlans: PlanMetadata[] = []
  const metadataList = Array.isArray(state.planMetadataList) ? state.planMetadataList : []

  metadataList.forEach((plan) => {
    try {
      // Ensure updatedAt is a valid date string before parsing
      const updatedAtTime =
        plan.updatedAt && typeof plan.updatedAt === "string"
          ? new Date(plan.updatedAt).getTime()
          : 0

      if (isNaN(updatedAtTime)) {
        console.warn(`Invalid updatedAt date for plan ${plan.id}: ${plan.updatedAt}`)
        olderPlans.push(plan) // Treat invalid dates as older
      } else if (updatedAtTime >= twentyFourHoursAgo) {
        recentPlans.push(plan)
      } else {
        olderPlans.push(plan)
      }
    } catch (e) {
      console.warn(`Error processing date for plan ${plan.id}:`, e)
      olderPlans.push(plan) // Treat errors as older
    }
  })

  // Sort recent plans by updatedAt descending
  recentPlans.sort((a, b) => {
    const dateA =
      a.updatedAt && typeof a.updatedAt === "string" ? new Date(a.updatedAt).getTime() : 0
    const dateB =
      b.updatedAt && typeof b.updatedAt === "string" ? new Date(b.updatedAt).getTime() : 0
    return dateB - dateA
  })

  // Sort older plans by createdAt descending (assuming list from DB is already sorted this way mostly)
  olderPlans.sort((a, b) => {
    const dateA =
      a.createdAt && typeof a.createdAt === "string" ? new Date(a.createdAt).getTime() : 0
    const dateB =
      b.createdAt && typeof b.createdAt === "string" ? new Date(b.createdAt).getTime() : 0
    return dateB - dateA
  })

  return [...recentPlans, ...olderPlans]
}

// Initialize after definition (if needed, otherwise rely on rehydration)
// if (typeof window !== "undefined") {
//   usePlanStore.getState()._initializeState();
//   usePlanStore.getState().fetchPlanMetadata();
// }
