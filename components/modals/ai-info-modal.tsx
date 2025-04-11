"use client"

import { create } from "zustand"
import AiAssistantDialog from "../ai-assistant-dialog"

interface AiInfoModalStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useAiInfoModal = create<AiInfoModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

export function AiInfoModal() {
  const { isOpen, close } = useAiInfoModal()

  return <AiAssistantDialog isOpen={isOpen} onClose={close} />
}
