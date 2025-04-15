"use client"

import { create } from "zustand"
import { TrainingPlanData } from "@/types/training-plan"
import React from "react"
import { useAiInfoModal } from "./ai-info-modal"

interface NewPlanModalStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useNewPlanModal = create<NewPlanModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

export function NewPlanModal() {
  const { isOpen, close } = useNewPlanModal()
  const aiInfoModal = useAiInfoModal()

  // Instead of opening the JSON upload modal, we'll directly open the AI assistant dialog
  React.useEffect(() => {
    if (isOpen) {
      close() // Close this modal immediately

      // Open the AI assistant dialog
      aiInfoModal.open()
    }
  }, [isOpen, close, aiInfoModal])

  // This component doesn't render anything since it immediately redirects
  return null
}
