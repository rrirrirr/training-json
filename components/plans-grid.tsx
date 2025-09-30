"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePlanStore, selectSortedPlanMetadata } from "@/store/plan-store" // Assuming selectSortedPlanMetadata is correctly typed
import { formatDistanceToNow } from "date-fns"
import { CalendarDays, ChevronRight, Edit, Trash2 } from "lucide-react"
import { useUIState } from "@/contexts/ui-context" // Assuming this context provides openJsonEditor
import { useToast } from "@/components/ui/use-toast"
import { DeletePlanDialog } from "@/components/dialogs/delete-plan-dialog"

// Define a more specific type for plan metadata if available
interface PlanMetadata {
  id: string
  name: string
  createdAt: string // Or Date
  updatedAt: string // Or Date
  // Add other metadata fields if present
}

// Type for the full plan object, adjust as necessary
interface FullPlan {
  id: string
  name: string
  data: any // Replace 'any' with a more specific type for planData
  createdAt: string // Or Date
  updatedAt: string // Or Date
}

export function PlansGrid() {
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)
  const fetchPlanById = usePlanStore((state) => state.fetchPlanById)
  const isLoading = usePlanStore((state) => state.isLoading) // Initial loading of all plans metadata
  const planStoreState = usePlanStore()

  // Use the specific PlanMetadata type here
  const planMetadataList = useMemo(
    () => selectSortedPlanMetadata(planStoreState) as PlanMetadata[],
    [planStoreState]
  )

  const { openJsonEditor } = useUIState()
  const { toast } = useToast()

  const [planToDelete, setPlanToDelete] = useState<{ id: string; name: string } | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  // This state is for when fetching full data for a *specific* plan for editing
  const [isFetchingSpecificPlan, setIsFetchingSpecificPlan] = useState(false)

  const handleEditClick = async (plan: PlanMetadata) => {
    setIsFetchingSpecificPlan(true)
    try {
      const fetchResult = await fetchPlanById(plan.id)
      if (fetchResult?.planData) {
        const fullPlanObjectForEditor: FullPlan = {
          id: plan.id,
          name: plan.name,
          data: fetchResult.planData,
          createdAt: plan.createdAt,
          updatedAt: plan.updatedAt,
        }
        openJsonEditor(fullPlanObjectForEditor) // Assumes openJsonEditor accepts this structure
      } else {
        console.error(`PlansGrid: Failed to load data for ${plan.id}`)
        toast({
          title: "Error",
          description: "Failed to load plan data for editing.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error(`PlansGrid: Error fetching data for ${plan.id}`, error)
      toast({
        title: "Error",
        description: "An error occurred while loading the plan.",
        variant: "destructive",
      })
    } finally {
      setIsFetchingSpecificPlan(false)
    }
  }

  const handleDeleteClick = (plan: { id: string; name: string }) => {
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      try {
        await removeLocalPlan(planToDelete.id) // Assuming this might also be async
        toast({
          title: "Plan Deleted",
          description: `"${planToDelete.name}" has been successfully deleted.`,
        })
      } catch (error) {
        console.error(`PlansGrid: Error deleting plan ${planToDelete.id}`, error)
        toast({
          title: "Error",
          description: "Failed to delete the plan.",
          variant: "destructive",
        })
      } finally {
        setIsDeleteDialogOpen(false)
        setPlanToDelete(null)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="animate-pulse bg-muted/40 h-24"></CardHeader>
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded-md w-2/3 mb-4"></div>
              <div className="h-3 bg-muted rounded-md w-1/2"></div>
            </CardContent>
            <CardFooter className="animate-pulse bg-muted/20 h-12"></CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (planMetadataList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center mx-auto max-w-md">
        <div className="mb-6 rounded-full bg-muted p-5">
          <CalendarDays className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-2xl font-semibold mb-3">No plans found</h3>
        <p className="text-muted-foreground mb-8">You don&apos;t have any training plans yet.</p>
        {/* Optional: Add a button to create a new plan */}
        {/* <Link href="/plan/new">
          <Button>Create New Plan</Button>
        </Link>
        */}
      </div>
    )
  }

  const now = Date.now()
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000

  const recentPlans = planMetadataList.filter(
    (plan) => new Date(plan.updatedAt).getTime() >= twentyFourHoursAgo
  )

  const olderPlans = planMetadataList.filter(
    (plan) => new Date(plan.updatedAt).getTime() < twentyFourHoursAgo
  )

  return (
    <>
      <div className="space-y-12">
        {recentPlans.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold px-2">Recent Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
              {recentPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  isEditing={isFetchingSpecificPlan} // Pass the specific plan fetching state
                />
              ))}
            </div>
          </div>
        )}

        {olderPlans.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold px-2">Older Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
              {olderPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  isEditing={isFetchingSpecificPlan} // Pass the specific plan fetching state
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeletePlanDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        planName={planToDelete?.name}
        title="Delete Training Plan"
      />
    </>
  )
}

interface PlanCardProps {
  plan: PlanMetadata // Use the more specific PlanMetadata type
  onEdit: (plan: PlanMetadata) => void // Parameter type matches
  onDelete: (plan: { id: string; name: string }) => void
  isEditing: boolean // Renamed from isFetchingData for clarity on the card
}

function PlanCard({ plan, onEdit, onDelete, isEditing }: PlanCardProps) {
  const createdDate = new Date(plan.createdAt)
  const updatedDate = new Date(plan.updatedAt)

  const createdAgo = formatDistanceToNow(createdDate, { addSuffix: true })
  const updatedAgo = formatDistanceToNow(updatedDate, { addSuffix: true }) // This is used for 'last viewed'

  // Check if the plan was updated (modified) recently for the badge
  const isRecentlyModified = Date.now() - new Date(plan.updatedAt).getTime() < 24 * 60 * 60 * 1000

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg hover:bg-muted/20 relative group flex flex-col">
      <CardHeader className="pb-3 px-6 pt-6">
        <CardTitle className="line-clamp-1 font-oswald font-light uppercase tracking-wide text-lg">
          {plan.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-2 text-xs">
          Created {createdAgo}
          {isRecentlyModified && ( // Badge indicates recent modification
            <Badge variant="secondary" className="ml-auto text-xs py-0.5 px-1.5">
              Updated
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0 px-6 flex-grow">
        {/* "Last viewed" might be misleading if 'updatedAt' is for modification time. 
            If 'updatedAt' truly tracks views, it's fine. Otherwise, consider removing or clarifying.
            For now, assuming 'updatedAt' is modification time.
        */}
      </CardContent>
      <CardFooter className="pt-5 pb-6 px-6 flex justify-between items-center">
        <Link href={`/plan/${plan.id}`} className="flex-1 mr-2">
          <Button variant="outline" className="w-full group">
            View Plan
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>

        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon" // Made icon buttons for cleaner look
            className="text-muted-foreground hover:text-primary h-8 w-8"
            onClick={() => onEdit(plan)}
            disabled={isEditing} // Disable while this specific plan's full data is being fetched for edit
            aria-label="Edit plan"
          >
            {isEditing ? ( // Show spinner only if this specific plan is being fetched for edit
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            ) : (
              <Edit className="h-4 w-4" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon" // Made icon buttons for cleaner look
            className="text-muted-foreground hover:text-destructive h-8 w-8"
            onClick={() => onDelete({ id: plan.id, name: plan.name })}
            aria-label="Delete plan"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
