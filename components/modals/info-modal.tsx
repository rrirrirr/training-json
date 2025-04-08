"use client"

import { create } from 'zustand'
import JsonInfoModal from '@/components/json-info-modal'

interface InfoModalStore {
  isOpen: boolean
  defaultTab: string
  open: (tab?: string) => void
  close: () => void
}

export const useInfoModal = create<InfoModalStore>((set) => ({
  isOpen: false,
  defaultTab: 'structure',
  open: (tab = 'structure') => set({ isOpen: true, defaultTab: tab }),
  close: () => set({ isOpen: false }),
}))

export function InfoModal() {
  const { isOpen, close, defaultTab } = useInfoModal()
  
  return (
    <JsonInfoModal 
      isOpen={isOpen} 
      onClose={close} 
      defaultTab={defaultTab} 
    />
  )
}