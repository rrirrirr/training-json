"use client"

import { create } from 'zustand'
import { useUploadModal } from './upload-modal'
import { TrainingPlanData } from '@/types/training-plan'
import React from 'react'

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
  const uploadModal = useUploadModal()
  
  // Instead of opening the name dialog, we'll directly redirect to the JSON upload modal
  React.useEffect(() => {
    if (isOpen) {
      close() // Close this modal immediately
      
      // Open the upload modal with a callback that dispatches the plan-created-from-json event
      uploadModal.open((data: TrainingPlanData) => {
        // Create and dispatch a custom event with the imported JSON data
        const event = new CustomEvent('plan-created-from-json', { 
          detail: { data } 
        })
        window.dispatchEvent(event)
      })
    }
  }, [isOpen, close, uploadModal])
  
  // This component doesn't render anything since it immediately redirects
  return null
}
