"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useRef,
  useEffect
} from "react";

// --- Types ---
export type GlobalAlertSeverity = 'warning' | 'info' | 'error' | 'edit' | null;

export interface GlobalAlertState {
  id: number; // Unique ID for each alert instance
  message: string | null;
  severity: GlobalAlertSeverity;
  isVisible: boolean;
  autoCloseDelay: number | null; // Delay in ms, null means no auto-close
  collapsible: boolean; // Whether the alert can be collapsed to just an icon
  collapseDelay: number | null; // Delay before collapsing, null means no auto-collapse
}

interface AlertContextType {
  alertState: GlobalAlertState;
  showAlert: (
    message: string,
    severity: GlobalAlertSeverity,
    options?: { 
      autoCloseDelay?: number | null;  // Delay before auto-closing, null for no auto-close
      collapsible?: boolean;           // Whether alert can be collapsed to just an icon
      collapseDelay?: number | null;   // Delay before collapsing, null for no auto-collapse
    } 
  ) => void;
  hideAlert: () => void;
}

// --- Context Definition ---
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// --- Provider Component ---
export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<GlobalAlertState>({
    id: 0, // Initial ID
    message: null,
    severity: null,
    isVisible: false,
    autoCloseDelay: null,
    collapsible: false,
    collapseDelay: null,
  });

  // Ref to store the auto-close timer
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Actions ---
  const showAlert = useCallback(
    (
      message: string,
      severity: GlobalAlertSeverity,
      options?: { 
        autoCloseDelay?: number | null;
        collapsible?: boolean;
        collapseDelay?: number | null;
      }
    ) => {
      // Clear any existing timer before showing a new alert
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
        autoCloseTimerRef.current = null;
      }

      const newId = Date.now(); // Use timestamp for a simple unique ID
      const autoCloseDelay = options?.autoCloseDelay ?? null; // Default to no auto-close
      const collapsible = options?.collapsible ?? false; // Default to not collapsible
      const collapseDelay = options?.collapseDelay ?? 3000; // Default to 3 seconds if collapsible is true

      console.log(`[AlertContext] Showing alert #${newId}: ${severity} - ${message} (Auto-close: ${autoCloseDelay ?? 'none'}, Collapsible: ${collapsible})`);
      setAlertState({
        id: newId,
        message,
        severity,
        isVisible: true,
        autoCloseDelay,
        collapsible,
        collapseDelay: collapsible ? collapseDelay : null,
      });

      // Set auto-close timer if delay is provided
      if (typeof autoCloseDelay === 'number' && autoCloseDelay > 0) {
        autoCloseTimerRef.current = setTimeout(() => {
          // Only hide if the *current* alert is still the one that triggered the timer
          setAlertState((currentState) => {
            if (currentState.isVisible && currentState.id === newId) {
              console.log(`[AlertContext] Auto-closing alert #${newId}`);
              return { ...currentState, isVisible: false };
            }
            return currentState; // Don't hide if a newer alert appeared
          });
        }, autoCloseDelay);
      }
    },
    [] // No dependencies needed for useCallback here
  );

  const hideAlert = useCallback(() => {
    // Clear timer if manually dismissed
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }

    setAlertState((prev) => {
      if (prev.isVisible) {
        console.log(`[AlertContext] Hiding alert #${prev.id}`);
        // Keep message/severity briefly for fade-out animation
        return { ...prev, isVisible: false, autoCloseDelay: null };
      }
      return prev; // No change if already hidden
    });

    // Optional: Fully clear state after animation
    // setTimeout(() => {
    //   setAlertState({ id: 0, message: null, severity: null, isVisible: false, autoCloseDelay: null });
    // }, 500); // Match animation duration
  }, []);

  // Effect to clear timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current);
      }
    };
  }, []);

  // --- Context Value ---
  const value = React.useMemo(
    () => ({
      alertState,
      showAlert,
      hideAlert,
    }),
    [alertState, showAlert, hideAlert]
  );

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
}

// --- Custom Hook ---
export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}