"use client"

import React, { useMemo } from "react"
import {
  Alert,
  AlertDescription,
  AlertTitle, // Import AlertTitle
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { AlertTriangle, Info, Edit, Ban } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAlert } from "@/contexts/alert-context"

interface GlobalAlertProps {
  icon?: React.ReactNode
}

export function GlobalAlert(props: GlobalAlertProps) {
  const { icon: customIconFromProps } = props
  const { alertState } = useAlert()
  const { message, severity, isVisible } = alertState

  const TriggerIcon = useMemo(() => {
    if (customIconFromProps) return customIconFromProps
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
  }, [severity, customIconFromProps])

  const alertContentSeverityClasses = useMemo(() => {
    switch (severity) {
      case "warning":
        return "bg-warning border-warning-border text-warning-foreground"
      case "error":
        return "bg-destructive border-destructive/50 text-destructive-foreground"
      case "info":
        return "bg-info border-info-border text-info-foreground"
      case "edit":
        return "bg-edit-mode-bg border-edit-mode-border text-edit-mode-text"
      default:
        return "bg-background border-border text-foreground"
    }
  }, [severity])

  const alertVariant = useMemo(() => {
    if (severity === "error") return "destructive"
    return "default"
  }, [severity])

  // Determine the title text based on severity
  const alertTitleText = useMemo(() => {
    switch (severity) {
      case "warning":
        return "Warning"
      case "error":
        return "Error"
      case "info":
        return "Information"
      case "edit":
        return "Editing Mode"
      default:
        return "Notification" // A sensible default
    }
  }, [severity])

  if (!isVisible) {
    return null
  }

  return (
    <div className="pointer-events-auto">
      <HoverCard openDelay={150} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-md",
              alertContentSeverityClasses
            )}
            aria-label={
              typeof message === "string"
                ? `${alertTitleText}: ${message}`
                : `${alertTitleText}: View alert details`
            }
          >
            {TriggerIcon}
          </Button>
        </HoverCardTrigger>
        <HoverCardContent
          className={cn("w-auto max-w-xs sm:max-w-sm md:max-w-md p-0 border-none shadow-xl")}
          side="right"
          align="start"
        >
          <Alert
            variant={alertVariant}
            className={cn(alertContentSeverityClasses, "px-4 py-3 rounded-md")}
          >
            {/* Add the AlertTitle here */}
            <AlertTitle>{alertTitleText}</AlertTitle>
            <AlertDescription className="text-sm">
              {typeof message === "string" ? message : <>{message}</>}
            </AlertDescription>
          </Alert>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
