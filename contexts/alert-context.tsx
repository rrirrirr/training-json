"use client"
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect,
} from "react"

// --- Types ---
export type GlobalAlertSeverity = "warning" | "info" | "error" | "edit" | null

export interface GlobalAlertState {
  id: number
  message: string | null
  severity: GlobalAlertSeverity
  isVisible: boolean
  autoCloseDelay: number | null
  collapsible: boolean
  collapseDelay: number | null
  action?: React.ReactNode // <--- ADDED: To hold the action element
}

interface AlertContextType {
  alertState: GlobalAlertState
  showAlert: (
    message: string,
    severity: GlobalAlertSeverity,
    options?: {
      autoCloseDelay?: number | null
      collapsible?: boolean
      collapseDelay?: number | null
      action?: React.ReactNode // <--- ADDED: Action property in options
    }
  ) => void
  hideAlert: () => void
}

// --- Context Definition ---
const AlertContext = createContext<AlertContextType | undefined>(undefined)

// --- Provider Component ---
export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<GlobalAlertState>({
    id: 0,
    message: null,
    severity: null,
    isVisible: false,
    autoCloseDelay: null,
    collapsible: false,
    collapseDelay: null,
    action: undefined, // <--- ADDED: Initialize action
  })

  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null)

  const showAlert = useCallback(
    (
      message: string,
      severity: GlobalAlertSeverity,
      options?: {
        autoCloseDelay?: number | null
        collapsible?: boolean
        collapseDelay?: number | null
        action?: React.ReactNode // <--- ADDED: Accept action in options
      }
    ) => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
        autoCloseTimerRef.current = null
      }

      const newId = Date.now()
      const autoCloseDelay = options?.autoCloseDelay ?? null
      const collapsible = options?.collapsible ?? false
      const collapseDelay = options?.collapseDelay ?? 3000
      const action = options?.action // <--- ADDED: Get action from options

      console.log(
        `[AlertContext] Showing alert #${newId}: ${severity} - ${message} (Action: ${!!action})`
      )
      setAlertState({
        id: newId,
        message,
        severity,
        isVisible: true,
        autoCloseDelay,
        collapsible,
        collapseDelay: collapsible ? collapseDelay : null,
        action, // <--- ADDED: Store action in state
      })

      if (typeof autoCloseDelay === "number" && autoCloseDelay > 0) {
        autoCloseTimerRef.current = setTimeout(() => {
          setAlertState((currentState) => {
            if (currentState.isVisible && currentState.id === newId) {
              console.log(`[AlertContext] Auto-closing alert #${newId}`)
              return { ...currentState, isVisible: false }
            }
            return currentState
          })
        }, autoCloseDelay)
      }
    },
    []
  )

  const hideAlert = useCallback(() => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current)
      autoCloseTimerRef.current = null
    }
    setAlertState((prev) => {
      if (prev.isVisible) {
        console.log(`[AlertContext] Hiding alert #${prev.id}`)
        // Keep state briefly for fade-out, but clear action if desired or keep for fade
        return { ...prev, isVisible: false, autoCloseDelay: null /* action: undefined */ }
      }
      return prev
    })
    // Optional: Fully clear state after animation
    // setTimeout(() => {
    //   setAlertState({ id: 0, message: null, severity: null, isVisible: false, autoCloseDelay: null, action: undefined });
    // }, 500);
  }, [])

  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
    }
  }, [])

  const value = React.useMemo(
    () => ({
      alertState,
      showAlert,
      hideAlert,
    }),
    [alertState, showAlert, hideAlert]
  )

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
}

// --- Custom Hook ---
export function useAlert() {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider")
  }
  return context
}
