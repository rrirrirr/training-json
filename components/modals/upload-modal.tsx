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
  
  // Don't create a handler - we want the EnhancedJsonUploadModal to enter edit mode directly
  // instead of saving to Supabase immediately
  console.log("[UploadModal] Rendering without onImport callback to ensure edit mode is used");
  
  return (
    <EnhancedJsonUploadModal 
      isOpen={isOpen} 
      onClose={close} 
      // No onImport prop - this will make the modal use enterEditMode directly
    />
  )
}