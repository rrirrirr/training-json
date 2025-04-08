"use client"

import { create } from 'zustand'
import EnhancedJsonUploadModal from '@/components/enhanced-json-upload-modal'
import { TrainingPlanData } from '@/types/training-plan'

interface UploadModalStore {
  isOpen: boolean
  onImportCallback: ((data: TrainingPlanData) => void) | null
  open: (callback: (data: TrainingPlanData) => void) => void
  close: () => void
}

export const useUploadModal = create<UploadModalStore>((set) => ({
  isOpen: false,
  onImportCallback: null,
  open: (callback) => set({ isOpen: true, onImportCallback: callback }),
  close: () => set({ isOpen: false }),
}))

export function UploadModal() {
  const { isOpen, close, onImportCallback } = useUploadModal()
  
  const handleImport = (data: TrainingPlanData) => {
    if (onImportCallback) {
      onImportCallback(data)
    }
    close()
  }
  
  return (
    <EnhancedJsonUploadModal 
      isOpen={isOpen} 
      onClose={close} 
      onImport={handleImport} 
    />
  )
}