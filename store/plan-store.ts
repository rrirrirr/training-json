import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TrainingPlanData } from '@/types/training-plan'
import { supabase } from '@/lib/supa-client'

// Define the type for plan metadata
interface PlanMetadata {
  id: string
  name: string
  createdAt: string
  updatedAt?: string
}

// Define the state structure for the store
interface PlanState {
  // State
  activePlan: TrainingPlanData | null  // Currently active plan
  planMetadata: PlanMetadata[]         // Metadata for all available plans
  isLoading: boolean                  // Loading state
  error: string | null                // Error message if any
  
  // Actions
  setActivePlan: (plan: TrainingPlanData) => void
  createPlan: (plan: TrainingPlanData) => Promise<string | null> // Returns plan ID
  editPlan: (planId: string, updatedPlan: TrainingPlanData) => Promise<string | null> // Returns new plan ID
  deletePlan: (planId: string) => Promise<boolean>
  loadPlansFromStorage: () => void
  loadPlanMetadata: () => Promise<void>
}

// Local storage keys
const ACTIVE_PLAN_KEY = 'tj-active-plan'
const PLAN_METADATA_KEY = 'tj-plan-metadata'

// Create the Zustand store
export const usePlanStore = create<PlanState>((set, get) => ({
  // Initial state
  activePlan: null,
  planMetadata: [],
  isLoading: false,
  error: null,
  
  // Set the active plan and save to localStorage
  setActivePlan: (plan) => {
    if (!plan) return
    
    try {
      // Update store state
      set({ activePlan: plan })
      
      // Save to localStorage
      localStorage.setItem(ACTIVE_PLAN_KEY, JSON.stringify(plan))
      
      console.log('Plan set as active:', plan.metadata?.planName || 'Unnamed Plan')
    } catch (error) {
      console.error('Error setting active plan:', error)
      set({ error: 'Failed to set active plan' })
    }
  },
  
  // Create a new plan in Supabase
  createPlan: async (plan) => {
    set({ isLoading: true, error: null })
    
    try {
      // Ensure the plan has metadata
      if (!plan.metadata) {
        plan.metadata = {
          planName: `Training Plan ${new Date().toLocaleDateString()}`,
          creationDate: new Date().toISOString()
        }
      }
      
      // Insert the plan into Supabase
      const { data, error } = await supabase
        .from('training_plans')
        .insert({
          plan_data: plan
        })
        .select('id')
        .single()
      
      if (error) throw error
      
      // Get the new plan ID
      const planId = data.id
      
      // Update the active plan and save to localStorage
      set({ 
        activePlan: plan,
        isLoading: false 
      })
      
      // Save to localStorage
      localStorage.setItem(ACTIVE_PLAN_KEY, JSON.stringify(plan))
      
      // Update metadata cache
      await get().loadPlanMetadata()
      
      console.log('New plan created:', plan.metadata?.planName || 'Unnamed Plan')
      return planId
    } catch (error) {
      console.error('Error creating plan:', error)
      set({ 
        error: 'Failed to create plan', 
        isLoading: false 
      })
      return null
    }
  },
  
  // Edit a plan (creates a new plan rather than updating existing one)
  editPlan: async (planId, updatedPlan) => {
    set({ isLoading: true, error: null })
    
    try {
      // Insert the updated plan as a new record in Supabase
      const { data, error } = await supabase
        .from('training_plans')
        .insert({
          plan_data: updatedPlan
        })
        .select('id')
        .single()
      
      if (error) throw error
      
      // Get the new plan ID
      const newPlanId = data.id
      
      // Update the active plan and save to localStorage
      set({ 
        activePlan: updatedPlan,
        isLoading: false 
      })
      
      // Save to localStorage
      localStorage.setItem(ACTIVE_PLAN_KEY, JSON.stringify(updatedPlan))
      
      // Update metadata cache
      await get().loadPlanMetadata()
      
      console.log('Plan edited (new version created):', updatedPlan.metadata?.planName || 'Unnamed Plan')
      return newPlanId
    } catch (error) {
      console.error('Error editing plan:', error)
      set({ 
        error: 'Failed to edit plan', 
        isLoading: false 
      })
      return null
    }
  },
  
  // Delete a plan (locally only, not from Supabase)
  deletePlan: async (planId) => {
    // We don't actually delete from Supabase, just remove from local state
    try {
      // Get current metadata and filter out the plan to delete
      const currentMetadata = [...get().planMetadata]
      const updatedMetadata = currentMetadata.filter(meta => meta.id !== planId)
      
      // Update metadata in store and localStorage
      set({ planMetadata: updatedMetadata })
      localStorage.setItem(PLAN_METADATA_KEY, JSON.stringify(updatedMetadata))
      
      // If the active plan is the one being deleted, clear it
      const activePlan = get().activePlan
      if (activePlan && planId === activePlan.id) {
        set({ activePlan: null })
        localStorage.removeItem(ACTIVE_PLAN_KEY)
      }
      
      console.log('Plan removed from local state:', planId)
      return true
    } catch (error) {
      console.error('Error deleting plan:', error)
      set({ error: 'Failed to delete plan' })
      return false
    }
  },
  
  // Load plans from localStorage
  loadPlansFromStorage: () => {
    try {
      // Load active plan
      const storedPlan = localStorage.getItem(ACTIVE_PLAN_KEY)
      if (storedPlan) {
        const parsedPlan = JSON.parse(storedPlan) as TrainingPlanData
        set({ activePlan: parsedPlan })
      }
      
      // Load plan metadata
      const storedMetadata = localStorage.getItem(PLAN_METADATA_KEY)
      if (storedMetadata) {
        const parsedMetadata = JSON.parse(storedMetadata) as PlanMetadata[]
        set({ planMetadata: parsedMetadata })
      }
      
      console.log('Plans loaded from localStorage')
    } catch (error) {
      console.error('Error loading plans from localStorage:', error)
      set({ error: 'Failed to load plans from localStorage' })
    }
  },
  
  // Fetch plan metadata from Supabase
  loadPlanMetadata: async () => {
    set({ isLoading: true, error: null })
    
    try {
      // Fetch plan metadata from Supabase
      const { data, error } = await supabase
        .from('training_plans')
        .select('id, plan_data->metadata, created_at')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      // Transform the data into PlanMetadata format
      const metadata: PlanMetadata[] = data.map(item => ({
        id: item.id,
        name: item.plan_data?.metadata?.planName || 'Unnamed Plan',
        createdAt: item.created_at,
      }))
      
      // Update store state and localStorage
      set({ 
        planMetadata: metadata,
        isLoading: false 
      })
      
      localStorage.setItem(PLAN_METADATA_KEY, JSON.stringify(metadata))
      
      console.log('Plan metadata loaded:', metadata.length, 'plans found')
    } catch (error) {
      console.error('Error loading plan metadata:', error)
      set({ 
        error: 'Failed to load plan metadata', 
        isLoading: false 
      })
    }
  }
}))
