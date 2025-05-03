"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle, Info, Edit, Ban } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAlert, GlobalAlertSeverity } from "@/contexts/alert-context"

interface GlobalAlertProps {
  icon?: React.ReactNode
}

export function GlobalAlert(props: GlobalAlertProps) {
  const { icon: customIcon } = props
  const { alertState, hideAlert } = useAlert()
  const {
    id: alertId,
    message,
    severity,
    isVisible,
    collapsible,
    collapseDelay,
    action,
  } = alertState

  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hasCompletedFirstCollapse, setHasCompletedFirstCollapse] = useState(false)
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentAlertIdRef = useRef<number>(0)

  const clearCollapseTimer = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = null
    }
  }

  const startInitialCollapseTimer = () => {
    clearCollapseTimer()
    if (
      isVisible &&
      collapsible &&
      collapseDelay &&
      collapseDelay > 0 &&
      !hasCompletedFirstCollapse
    ) {
      collapseTimeoutRef.current = setTimeout(() => {
        if (alertId === currentAlertIdRef.current && isVisible && collapsible) {
          setIsCollapsed(true)
          setHasCompletedFirstCollapse(true)
        }
        collapseTimeoutRef.current = null
      }, collapseDelay)
    }
  }

  useEffect(() => {
    clearCollapseTimer()
    if (isVisible && alertId !== currentAlertIdRef.current) {
      setIsCollapsed(false)
      setHasCompletedFirstCollapse(false)
      currentAlertIdRef.current = alertId
    }
    if (!collapsible || !isVisible) {
      setIsCollapsed(false)
      clearCollapseTimer()
    }
    return () => {
      clearCollapseTimer()
    }
  }, [isVisible, collapsible, alertId])

  const handleMouseEnter = () => {
    if (!collapsible) return
    clearCollapseTimer()
    if (isCollapsed) {
      setIsCollapsed(false)
    }
  }

  const handleMouseLeave = () => {
    if (!collapsible || !isVisible) return
    if (hasCompletedFirstCollapse) {
      clearCollapseTimer()
      setIsCollapsed(true)
    } else {
      startInitialCollapseTimer()
    }
  }

  const Icon = useMemo(() => {
    if (customIcon) return customIcon
    switch (severity) {
      case "warning":
        return <AlertTriangle className="h-5 w-5" />
      case "error":
        return <Ban className="h-5 w-5" />
      case "info":
        return <Info className="h-5 w-5" />
      case "edit":
        return <Edit className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }, [severity, customIcon])

  const getSeverityClasses = () => {
    switch (severity) {
      case "warning":
        return "bg-warning border-warning-border text-warning-foreground" // Assumes theme colors are defined
      case "error":
        return "bg-destructive border-destructive/50 text-destructive-foreground" // Adjusted for typical destructive setup
      case "info":
        return "bg-info border-info-border text-info-foreground" // Assumes theme colors are defined
      case "edit":
        return "bg-edit-mode-bg border-edit-mode-border text-edit-mode-text" // Uses classes defined in previous steps
      default:
        return "bg-background border-border text-foreground"
    }
  }

  const severityClasses = getSeverityClasses()
  const showFullContent = !isCollapsed

  return (
    <div
      className={cn(
        "z-40 max-w-md",
        "transition-opacity duration-150 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="alert"
      aria-live="polite"
      aria-hidden={!isVisible}
    >
      <div className="relative">
        <div
          className={cn(
            "border shadow-md overflow-hidden",
            severityClasses,
            "flex items-center",
            "transition-[width,height,padding] duration-150 ease-in-out origin-left",
            isCollapsed ? "rounded-full" : "rounded-md",
            isCollapsed ? "w-10 h-10 p-0" : "min-h-[40px] pl-10 pr-8 py-2"
          )}
        >
          <div
            className={cn(
              "absolute left-0 top-0 w-10 h-10 flex items-center justify-center",
              "transition-none"
            )}
          >
            {Icon}
          </div>

          <div
            className={cn(
              "flex-grow flex items-center min-w-0 mr-2",
              "transition-opacity duration-75 ease-in-out",
              showFullContent ? "opacity-100 delay-75" : "opacity-0",
              !showFullContent && "pointer-events-none"
            )}
          >
            {message && (
              <div
                className={cn(
                  "text-sm flex-shrink min-w-0",
                  !showFullContent && "overflow-hidden whitespace-nowrap"
                )}
              >
                <AlertDescription>
                  {typeof message === "string" ? message : <>{message}</>}
                </AlertDescription>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              hideAlert()
            }}
            className={cn(
              "absolute right-1 top-1/2 -translate-y-1/2 z-10",
              "h-6 w-6 flex-shrink-0",
              "transition-opacity duration-150 ease-in-out",
              showFullContent ? "opacity-100 delay-75" : "opacity-0 pointer-events-none",
              severity === "warning"
                ? "text-warning-foreground hover:bg-warning/20"
                : severity === "error"
                  ? "text-destructive-foreground hover:bg-destructive/20"
                  : severity === "info"
                    ? "text-info-foreground hover:bg-info/20"
                    : severity === "edit"
                      ? "text-edit-mode-text hover:bg-edit-mode-hover-bg" // Assumes hover bg is defined
                      : "text-foreground hover:bg-secondary"
            )}
            aria-label="Dismiss alert"
            tabIndex={showFullContent ? 0 : -1}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
