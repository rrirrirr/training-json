"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Edit, Trash2, MoreHorizontal, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePlanStore } from "@/store/plan-store"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PlanSwitcher } from "@/components/plan-switcher"

interface PlanHeaderProps {
  planId: string
}

export default function PlanHeader({ planId }: PlanHeaderProps) {
  const router = useRouter()
  
  // State for confirm delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Get data and actions from Zustand store
  const activePlan = usePlanStore((state) => state.activePlan)
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const createPlanFromEdit = usePlanStore((state) => state.createPlanFromEdit)
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata)
  
  // Get plan name
  const planName = activePlan?.metadata?.planName || "Unknown Plan"
  
  // Load plan metadata on mount if not already loaded
  if (planMetadataList.length === 0) {
    fetchPlanMetadata()
  }
  
  // Handle editing the plan (creates a new plan from the edit)
  const handleEditPlan = async () => {
    if (!activePlan) return
    
    router.push(`/edit-plan/${planId}`)
  }
  
  // Handle deleting the plan locally (not from Supabase)
  const handleDeletePlan = async () => {
    if (!planId) return
    
    const success = await removeLocalPlan(planId)
    
    if (success) {
      // Navigate to home if successful
      router.push("/")
    }
    
    setIsDeleteDialogOpen(false)
  }
  
  // Go back to home page
  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <header className="border-b bg-background px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGoHome} 
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Home
          </Button>
          
          {/* Plan name */}
          <h1 className="font-medium truncate max-w-[150px] sm:max-w-md">{planName}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Plan switcher (dropdown) */}
          <PlanSwitcher />
          
          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditPlan}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Plan
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the plan "{planName}"? 
              This will only remove it from your local view, not from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlan}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  )
}
