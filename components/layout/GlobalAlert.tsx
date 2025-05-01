"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Info, Edit, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlert, GlobalAlertSeverity } from "@/contexts/alert-context"; // Import the alert hook and type

// Define the props - These are now mainly for configuration, state comes from context
interface GlobalAlertProps {
  canCollapse?: boolean;
  collapseDelay?: number; // Note: Auto-close delay is handled by context now
  icon?: React.ReactNode; // Optional custom icon override
}

// Default props for configuration
const defaultProps: Partial<GlobalAlertProps> = {
  canCollapse: false,
  collapseDelay: 3000, // This delay is now for the visual collapse, not auto-hiding
};

export function GlobalAlert(props: GlobalAlertProps) {
  const {
      canCollapse = defaultProps.canCollapse,
      collapseDelay = defaultProps.collapseDelay,
      icon: customIcon,
  } = props;

  // Get state and actions from the context
  const { alertState, hideAlert } = useAlert();
  const { id: alertId, message, severity, isVisible } = alertState; // Use alertId from state

  // Local state for visual collapse/hover effect
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAlertIdRef = useRef<number>(0); // Ref to track the ID for collapse logic

  // Visual auto-collapse logic (separate from auto-hiding in context)
  useEffect(() => {
    if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);

    // If a new alert appears, reset collapse state immediately
    if (isVisible && alertId !== currentAlertIdRef.current) {
        setIsCollapsed(false);
        currentAlertIdRef.current = alertId; // Track the new alert ID
    }

    // Set timer only if the alert is visible, collapse is enabled, and it's not already collapsed
    if (isVisible && canCollapse && !isCollapsed) {
      collapseTimeoutRef.current = setTimeout(() => {
        // Only collapse if the alert hasn't changed since the timer started
         if (alertId === currentAlertIdRef.current) {
            setIsCollapsed(true);
         }
      }, collapseDelay);
    }

    // Reset collapse state if alert becomes hidden
    if (!isVisible) {
      setIsCollapsed(false);
      currentAlertIdRef.current = 0; // Reset tracked ID
    }

    return () => { if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current); };
  }, [isVisible, canCollapse, collapseDelay, isCollapsed, alertId]); // Add alertId dependency

  useEffect(() => { if (!canCollapse) setIsCollapsed(false); }, [canCollapse]);

  // Determine Icon
  const Icon = useMemo(() => {
    if (customIcon) return customIcon;
    switch (severity) {
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'error': return <Ban className="h-5 w-5" />;
      case 'info': return <Info className="h-5 w-5" />;
      case 'edit': return <Edit className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  }, [severity, customIcon]);

  // Determine styling
  const getSeverityClasses = () => {
    switch (severity) {
      case 'warning': return "bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300";
      case 'error': return "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300";
      case 'info': return "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300";
      case 'edit': return "bg-[var(--edit-mode-bg)] border-[var(--edit-mode-border)] text-[var(--edit-mode-text)]";
      default: return "bg-background border-border text-foreground";
    }
  };
  const severityClasses = getSeverityClasses();
  const showFullContent = !isCollapsed || isHovering;

  // Use `isVisible` from context to control animation state
  // Render container even when !isVisible briefly to allow fade-out animation
  return (
    <div
      className={cn(
        "z-40 max-w-md", // Set max width or other sizing constraints
        "transition-opacity duration-300 ease-in-out", // Use opacity transition
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none" // Control visibility via opacity
      )}
      onMouseEnter={() => canCollapse && setIsHovering(true)}
      onMouseLeave={() => canCollapse && setIsHovering(false)}
      role="alert"
      aria-live="polite"
      aria-hidden={!isVisible} // Hide from accessibility tree when not visible
    >
      {/* Inner div with styling and content */}
      <div
        className={cn(
          "relative w-full rounded-md border p-3 shadow-md",
          severityClasses,
          "flex items-center gap-3",
          "transition-all duration-300 ease-in-out", // Visual collapse transition
          isCollapsed && !isHovering ? "w-auto px-3 py-2" : "" // Styles for visual collapse
        )}
      >
        <div className="flex-shrink-0">{Icon}</div>
        {showFullContent && message && (
          <div className="flex-grow text-sm">
            <AlertDescription>{message}</AlertDescription>
          </div>
        )}
        {showFullContent && (
          <Button
            variant="ghost"
            size="icon"
            onClick={hideAlert} // Use hideAlert from context
            className={cn(
              "h-6 w-6 flex-shrink-0 ml-auto",
              // Adjust text color based on severity for better contrast
              severity === 'warning' ? "text-yellow-800 hover:bg-yellow-200/50 dark:text-yellow-300 dark:hover:bg-yellow-700/30" :
              severity === 'error' ? "text-red-800 hover:bg-red-200/50 dark:text-red-300 dark:hover:bg-red-700/30" :
              severity === 'info' ? "text-blue-800 hover:bg-blue-200/50 dark:text-blue-300 dark:hover:bg-blue-700/30" :
              severity === 'edit' ? "text-[var(--edit-mode-text)] hover:bg-black/10 dark:hover:bg-white/10" :
              "text-foreground hover:bg-secondary"
            )}
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}