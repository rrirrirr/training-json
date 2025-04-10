"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

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
  planActionType: 'edit' | 'delete' | null
  planActionTarget: any | null
  openPlanActionDialog: (type: 'edit' | 'delete', plan: any) => void
  closePlanActionDialog: () => void
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
  const [planActionType, setPlanActionType] = useState<'edit' | 'delete' | null>(null)
  const [planActionTarget, setPlanActionTarget] = useState<any | null>(null)
  
  // Mobile navigation actions
  const openMobileNav = useCallback(() => setIsMobileNavOpen(true), [])
  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), [])
  const toggleMobileNav = useCallback(() => setIsMobileNavOpen(prev => !prev), [])
  
  // Sidebar actions
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), [])
  const openSidebar = useCallback(() => setIsSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  
  // Dialog actions
  const openSettingsDialog = useCallback(() => setIsSettingsDialogOpen(true), [])
  const closeSettingsDialog = useCallback(() => setIsSettingsDialogOpen(false), [])
  
  const openInfoDialog = useCallback(() => setIsInfoDialogOpen(true), [])
  const closeInfoDialog = useCallback(() => setIsInfoDialogOpen(false), [])
  
  // Plan action dialog
  const openPlanActionDialog = useCallback((type: 'edit' | 'delete', plan: any) => {
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
    closePlanActionDialog
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