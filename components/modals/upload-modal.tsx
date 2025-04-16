"use client"

import { create } from 'zustand'
import EnhancedJsonUploadModal from '@/components/enhanced-json-upload-modal'
import { TrainingPlanData } from '@/types/training-plan'

interface UploadModalStore {
  isOpen: boolean
  onImportCallback: ((data: TrainingPlanData) => void) | null
  open: (callback?: (data: TrainingPlanData) => void) => void // Made callback optional
  close: () => void
}

export const useUploadModal = create<UploadModalStore>((set) => ({
  isOpen: false,
  onImportCallback: null,
  // Modified to make callback optional
  open: (callback) => set({ isOpen: true, onImportCallback: callback || null }),
  close: () => set({ isOpen: false }),
}))

export function UploadModal() {
  const { isOpen, close, onImportCallback } = useUploadModal()
  
  // Only create a handler if a callback was provided, otherwise pass null
  // This allows the EnhancedJsonUploadModal to enter edit mode directly
  const handleImport = onImportCallback 
    ? (data: TrainingPlanData) => {
        console.log("[UploadModal] Import handler called with callback");
        // If a callback was provided, execute it
        onImportCallback(data)
        
        // Close the modal
        close()
      }
    : null
  
  console.log("[UploadModal] Rendering with onImport callback:", !!handleImport);
  
  return (
    <EnhancedJsonUploadModal 
      isOpen={isOpen} 
      onClose={close} 
      onImport={handleImport} 
    />
  )
}