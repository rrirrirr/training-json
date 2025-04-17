"use client"
import { UploadModal } from './upload-modal'
import { InfoModal } from './info-modal'
import { AiInfoModal } from './ai-info-modal'
import { NewPlanModal } from './new-plan-modal'

export function ModalProvider() {
  return (
    <>
      <UploadModal />
      <InfoModal />
      <AiInfoModal />
      <NewPlanModal />
    </>
  )
}