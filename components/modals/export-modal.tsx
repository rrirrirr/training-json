"use client"

import { create } from 'zustand'
import ExportJsonDialog from '@/components/export-json-dialog'

interface ExportModalStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useExportModal = create<ExportModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

export function ExportModal() {
  const { isOpen, close } = useExportModal()
  
  return (
    <ExportJsonDialog 
      isOpen={isOpen} 
      onClose={close}
    />
  )
}