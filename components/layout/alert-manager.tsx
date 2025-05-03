"use client"

import { useAlert } from "@/contexts/alert-context"
import { usePlanStore } from "@/store/plan-store"
import { usePathname, useRouter } from "next/navigation"
import React, { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

function UnsavedChangesAlertHandler() {
  const hasUnsavedChanges = usePlanStore((state) => state.hasUnsavedChanges)
  const originalPlanId = usePlanStore((state) => state.originalPlanId)
  const mode = usePlanStore((state) => state.mode)
  const draftPlan = usePlanStore((state) => state.draftPlan)

  const { showAlert, hideAlert, alertState } = useAlert()
  const pathname = usePathname()
  const router = useRouter()

  const planName = draftPlan?.metadata?.planName || "Unnamed Plan"
  const unsavedAlertBaseMessage = `You have unsaved changes on "${planName}". `
  const unsavedAlertSeverity = "warning"

  const alertMessageNode = (
    <span>
      {unsavedAlertBaseMessage}
      {originalPlanId && (
        <Button
          asChild
          variant="link"
          className={cn(
            "p-0 h-auto font-medium underline underline-offset-2",
            unsavedAlertSeverity === "warning"
              ? "text-warning-foreground hover:text-warning-foreground/90" // Assumes 'warning' color is defined in theme
              : unsavedAlertSeverity === "edit"
                ? "text-edit-mode-text hover:text-edit-mode-hover-text" // Assumes 'edit-mode-hover-text' is defined
                : "text-foreground hover:text-foreground/90"
          )}
        >
          <Link href={`/plan/${originalPlanId}/edit`}>Edit Plan</Link>
        </Button>
      )}
    </span>
  )

  useEffect(() => {
    const isEditPage =
      mode === "edit" && originalPlanId
        ? pathname === `/plan/${originalPlanId}/edit`
        : pathname === "/plan/edit"

    const shouldShowAlert = hasUnsavedChanges && !isEditPage

    const isUnsavedAlertVisible =
      alertState.isVisible &&
      typeof alertState.message === "object" &&
      (alertState.message as React.ReactElement)?.props?.children?.[0] ===
        unsavedAlertBaseMessage &&
      alertState.severity === unsavedAlertSeverity

    if (shouldShowAlert && !isUnsavedAlertVisible) {
      showAlert(alertMessageNode, unsavedAlertSeverity, {
        collapsible: true,
        collapseDelay: 4000,
        autoCloseDelay: null,
      })
    } else if (!shouldShowAlert && isUnsavedAlertVisible) {
      hideAlert()
    }
  }, [
    hasUnsavedChanges,
    pathname,
    mode,
    originalPlanId,
    planName,
    alertState.isVisible,
    alertState.message,
    alertState.severity,
    showAlert,
    hideAlert,
    router,
    unsavedAlertSeverity,
    unsavedAlertBaseMessage,
    alertMessageNode,
  ])

  return null
}

export function AlertManager() {
  return (
    <>
      <UnsavedChangesAlertHandler />
    </>
  )
}
