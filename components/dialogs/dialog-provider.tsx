"use client"

import { SettingsDialog } from "./settings-dialog"
import { InfoDialog } from "./info-dialog"
import { PlanActionDialog } from "./plan-action-dialog"
import { SidebarDialogs } from "./sidebar-dialogs"

export function DialogProvider() {
  return (
    <>
      <SettingsDialog />
      <InfoDialog />
      <PlanActionDialog />
      <SidebarDialogs />
    </>
  )
}
