"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle, Info, Edit, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlert, GlobalAlertSeverity } from "@/contexts/alert-context";

interface GlobalAlertProps {
  icon?: React.ReactNode; // Optional custom icon override
}

export function GlobalAlert(props: GlobalAlertProps) {
  const { icon: customIcon } = props;

  // Get state and actions from the context
  const { alertState, hideAlert } = useAlert();
  const { 
    id: alertId, 
    message, 
    severity, 
    isVisible, 
    collapsible, 
    collapseDelay 
  } = alertState;

  // Local state for visual collapse/hover effect
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAlertIdRef = useRef<number>(0);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Visual auto-collapse logic
  useEffect(() => {
    if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);

    // If a new alert appears, reset collapse state immediately
    if (isVisible && alertId !== currentAlertIdRef.current) {
      setIsCollapsed(false);
      currentAlertIdRef.current = alertId;
    }

    // Set timer for collapse
    if (isVisible && collapsible && !isCollapsed && collapseDelay) {
      collapseTimeoutRef.current = setTimeout(() => {
        if (alertId === currentAlertIdRef.current) {
          setIsTransitioning(true); // Start transition
          setIsCollapsed(true);
          
          // Clear transition flag after animation completes
          transitionTimerRef.current = setTimeout(() => {
            setIsTransitioning(false);
          }, 300); // Match transition duration
        }
      }, collapseDelay);
    }

    // Reset collapse state if alert becomes hidden
    if (!isVisible) {
      setIsCollapsed(false);
      currentAlertIdRef.current = 0;
    }

    return () => { 
      if (collapseTimeoutRef.current) clearTimeout(collapseTimeoutRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [isVisible, collapsible, collapseDelay, isCollapsed, alertId]);

  // Handle hover state changes
  const handleMouseEnter = () => {
    if (!collapsible) return;
    
    setIsHovering(true);
    setIsTransitioning(true); // Start transition
    
    // Clear transition flag after animation
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };
  
  const handleMouseLeave = () => {
    if (!collapsible) return;
    
    setIsHovering(false);
    setIsTransitioning(true); // Start transition
    
    // Clear transition flag after animation
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  };

  useEffect(() => { 
    if (!collapsible) setIsCollapsed(false); 
  }, [collapsible]);

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

  return (
    <div
      className={cn(
        "z-40 max-w-md",
        "transition-opacity duration-300 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
      aria-hidden={!isVisible}
    >
      {/* Main container with fixed-position icon */}
      <div className="relative">
        {/* Alert container that grows from the icon */}
        <div 
          className={cn(
            "border shadow-md overflow-hidden",
            severityClasses,
            "flex items-center",
            "transition-all duration-300 ease-in-out origin-left",
            // When collapsed, it's a perfect circle at the left edge
            isCollapsed && !isHovering 
              ? "w-10 h-10 rounded-full" 
              : "rounded-md min-h-[40px] pl-10 pr-3 py-3", // Fixed left padding for icon
          )}
        >
          {/* Icon - always at the same position */}
          <div className={cn(
            "absolute left-0 top-0 w-10 h-10 flex items-center justify-center",
            "transition-none" // No transition on the icon to keep it stable
          )}>
            {Icon}
          </div>
          
          {/* Content container - Only shown when expanded */}
          <div className={cn(
            "flex-grow ml-0", // No left margin as icon is absolutely positioned
            "transition-opacity duration-200 ease-in-out",
            showFullContent ? "opacity-100" : "opacity-0",
            isCollapsed && !isHovering ? "invisible" : "visible"
          )}>
            {message && (
              <div className="text-sm">
                <AlertDescription>{message}</AlertDescription>
              </div>
            )}
          </div>
          
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={hideAlert}
            className={cn(
              "h-6 w-6 flex-shrink-0 ml-2",
              "transition-opacity duration-200 ease-in-out",
              showFullContent ? "opacity-100" : "opacity-0",
              !showFullContent ? "hidden" : "",
              // Severity-based styling
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
        </div>
      </div>
    </div>
  );
}