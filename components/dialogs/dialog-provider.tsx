"use client"

import { SettingsDialog } from './settings-dialog'
import { InfoDialog } from './info-dialog'
import { PlanActionDialog } from './plan-action-dialog'

export function DialogProvider() {
  return (
    <>
      <SettingsDialog />
      <InfoDialog />
      <PlanActionDialog />
    </>
  )
}