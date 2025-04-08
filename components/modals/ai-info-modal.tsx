"use client"

import { create } from 'zustand'
import JsonInfoModal from '@/components/json-info-modal'

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
  
  return (
    <JsonInfoModal 
      isOpen={isOpen} 
      onClose={close} 
      defaultTab="ai" 
    />
  )
}