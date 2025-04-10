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
}

// Create the context with a default undefined value
const UIContext = createContext<UIContextType | undefined>(undefined)

// Provider component
export function UIProvider({ children }: { children: React.ReactNode }) {
  // Mobile navigation state
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  
  // Sidebar state (for desktop)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  
  // Mobile navigation actions
  const openMobileNav = useCallback(() => setIsMobileNavOpen(true), [])
  const closeMobileNav = useCallback(() => setIsMobileNavOpen(false), [])
  const toggleMobileNav = useCallback(() => setIsMobileNavOpen(prev => !prev), [])
  
  // Sidebar actions
  const toggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), [])
  const openSidebar = useCallback(() => setIsSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])
  
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
