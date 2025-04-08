"use client"

import { create } from 'zustand'
import PlanNameDialog from '@/components/plan-name-dialog'
import { TrainingPlanData } from '@/types/training-plan'

interface NewPlanModalStore {
  isOpen: boolean
  onSaveCallback: ((name: string) => void) | null
  open: (callback: (name: string) => void) => void
  close: () => void
}

export const useNewPlanModal = create<NewPlanModalStore>((set) => ({
  isOpen: false,
  onSaveCallback: null,
  open: (callback) => set({ isOpen: true, onSaveCallback: callback }),
  close: () => set({ isOpen: false }),
}))

export function NewPlanModal() {
  const { isOpen, close, onSaveCallback } = useNewPlanModal()
  
  const handleSave = (name: string) => {
    if (onSaveCallback) {
      onSaveCallback(name)
    }
    close()
  }
  
  return (
    <PlanNameDialog 
      isOpen={isOpen} 
      onClose={close} 
      onSave={handleSave} 
      title="Skapa ny träningsplan" 
      description="Ge din träningsplan ett namn som hjälper dig identifiera den senare." 
    />
  )
}