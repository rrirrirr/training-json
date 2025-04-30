"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

// Import usePlanStore for accessing plan state
import { usePlanStore } from "@/store/plan-store"

// Define the shape of our UI context
import type { PlanMetadata } from "@/store/plan-store"

// Define the shape of our UI context
interface UIContextType {
  // Mobile navigation state
  isMobileNavOpen: boolean
  openMobileNav: () => void
  closeMobileNav: () => void
  toggleMobileNav: () => void

  // Sidebar state (for desktop)
  isSidebarOpen: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void

  // Dialog state
  isSettingsDialogOpen: boolean
  openSettingsDialog: () => void
  closeSettingsDialog: () => void

  isInfoDialogOpen: boolean
  openInfoDialog: () => void
  closeInfoDialog: () => void

  isPlanActionDialogOpen: boolean
  planActionType: "edit" | "delete" | null
  planActionTarget: any | null
  openPlanActionDialog: (type: "edit" | "delete", plan: any) => void
  closePlanActionDialog: () => void

  // NEW Properties for AppSidebar Dialogs

  // Delete Confirmation Dialog
  isDeleteDialogOpen: boolean
  planToDelete: PlanMetadata | null
  openDeleteDialog: (plan: PlanMetadata) => void
  closeDeleteDialog: () => void

  // Switch Warning Dialog
  isSwitchWarningOpen: boolean
  planToSwitchToId: string | null
  isSwitchToEditMode: boolean
  openSwitchWarningDialog: (planId: string, isEditNavigation?: boolean) => void
  closeSwitchWarningDialog: () => void

  // JSON Editor Dialog
  isJsonEditorOpen: boolean
  planToViewJson: any | null
  openJsonEditor: (planData: any) => void
  closeJsonEditor: () => void
}

// Create the context with a default undefined value
const UIContext = createContext<UIContextType | undefined>(undefined)

// Provider component
export function UIProvider({ children }: { children: React.ReactNode }) {
  // Mobile navigation state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  // Sidebar state (for desktop)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Dialog states
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false)
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false)

  // Plan action dialog (combined edit/delete)
  const [isPlanActionDialogOpen, setIsPlanActionDialogOpen] = useState(false)
  const [planActionType, setPlanActionType] = useState<"edit" | "delete" | null>(null)
  const [planActionTarget, setPlanActionTarget] = useState<any | null>(null)

  // NEW Dialog states for AppSidebar
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<PlanMetadata | null>(null)
  const [isSwitchWarningOpen, setIsSwitchWarningOpen] = useState(false)
  const [planToSwitchToId, setPlanToSwitchToId] = useState<string | null>(null)
  const [isSwitchToEditMode, setIsSwitchToEditMode] = useState(false)
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)
  const [planToViewJson, setPlanToViewJson] = useState<any | null>(null)

  // Mobile navigation actions
  // Mobile navigation actions
  const openMobileNav = useCallback(() => setIsMobileNavOpen(true), [])
  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), [])
  const toggleMobileNav = useCallback(() => setIsMobileNavOpen((prev) => !prev), [])

  // Sidebar actions
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), [])
  const openSidebar = useCallback(() => setIsSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])

  // Dialog actions
  const openSettingsDialog = useCallback(() => setIsSettingsDialogOpen(true), [])
  const closeSettingsDialog = useCallback(() => setIsSettingsDialogOpen(false), [])

  const openInfoDialog = useCallback(() => setIsInfoDialogOpen(true), [])
  const closeInfoDialog = useCallback(() => setIsInfoDialogOpen(false), [])

  // Plan action dialog
  const openPlanActionDialog = useCallback((type: "edit" | "delete", plan: any) => {
    setPlanActionType(type)
    setPlanActionTarget(plan)
    setIsPlanActionDialogOpen(true)
  }, [])

  const closePlanActionDialog = useCallback(() => {
    setIsPlanActionDialogOpen(false)
    // Reset values after a small delay to prevent UI flickering
    setTimeout(() => {
      setPlanActionType(null)
      setPlanActionTarget(null)
    }, 200)
  }, [])

  // NEW Dialog actions for AppSidebar
  const openDeleteDialog = useCallback((plan: PlanMetadata) => {
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
  }, [])

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false)
    // Delay clearing data to avoid UI flicker if dialog animates out
    setTimeout(() => setPlanToDelete(null), 300)
  })

  const openSwitchWarningDialog = useCallback(
    (planId: string, isEditNavigation: boolean = false) => {
      console.log(
        `[UIContext] openSwitchWarningDialog called with planId: ${planId}, isEditNavigation: ${isEditNavigation}`
      )
      console.log(`[UIContext] planId type: ${typeof planId}`)
      setPlanToSwitchToId(planId)
      setIsSwitchToEditMode(isEditNavigation)
      setIsSwitchWarningOpen(true)
    },
    []
  )

  const closeSwitchWarningDialog = useCallback(() => {
    setIsSwitchWarningOpen(false)
    setTimeout(() => setPlanToSwitchToId(null), 300)
  }, [])

  const openJsonEditor = useCallback((planData: any) => {
    // Check if we're in edit mode and have unsaved changes for this plan
    const currentStore = usePlanStore.getState()
    const isEditingThisPlan =
      currentStore.mode === "edit" &&
      currentStore.hasUnsavedChanges &&
      currentStore.originalPlanId === planData.id

    // If we're editing this plan and have unsaved changes, use the draft data
    if (isEditingThisPlan && currentStore.draftPlan) {
      console.log("[UIContext] Using draft plan data for JSON editor as it has unsaved changes")
      setPlanToViewJson({
        ...planData,
        data: currentStore.draftPlan,
      })
    } else {
      // Otherwise use the provided plan data
      console.log("[UIContext] Using provided plan data for JSON editor")
      setPlanToViewJson(planData)
    }

    setIsJsonEditorOpen(true)
  }, [])

  const closeJsonEditor = useCallback(() => {
    setIsJsonEditorOpen(false)
    setTimeout(() => setPlanToViewJson(null), 300)
  }, [])

  // Create the context value object
  const value = {
    isMobileNavOpen,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
    isSidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    isSettingsDialogOpen,
    openSettingsDialog,
    closeSettingsDialog,
    isInfoDialogOpen,
    openInfoDialog,
    closeInfoDialog,
    isPlanActionDialogOpen,
    planActionType,
    planActionTarget,
    openPlanActionDialog,
    closePlanActionDialog,

    // NEW Dialog values for AppSidebar
    isDeleteDialogOpen,
    planToDelete,
    openDeleteDialog,
    closeDeleteDialog,
    isSwitchWarningOpen,
    planToSwitchToId,
    isSwitchToEditMode,
    openSwitchWarningDialog,
    closeSwitchWarningDialog,
    isJsonEditorOpen,
    planToViewJson,
    openJsonEditor,
    closeJsonEditor,
  }
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

// Custom hook to use the UI context
export function useUIState() {
  const context = useContext(UIContext)

  if (context === undefined) {
    throw new Error("useUIState must be used within a UIProvider")
  }

  return context
}
