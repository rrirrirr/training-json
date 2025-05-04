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
import { usePlanStore, selectSortedPlanMetadata } from "@/store/plan-store"
import { formatDistanceToNow } from "date-fns"
import { CalendarDays, ChevronRight, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import JsonEditor from "@/components/json-editor"

export function PlansGrid() {
  const removeLocalPlan = usePlanStore((state) => state.removeLocalPlan)
  const isLoading = usePlanStore((state) => state.isLoading)
  const planStoreState = usePlanStore()
  const planMetadataList = useMemo(() => selectSortedPlanMetadata(planStoreState), [planStoreState])

  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false)
  const [planToViewJson, setPlanToViewJson] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<{ id: string; name: string } | null>(null)

  // No useEffect for fetching - we're only using what's in the store

  const handleViewJson = (plan: any) => {
    setPlanToViewJson({
      id: plan.id,
      name: plan.name,
      // Note: This doesn't include actual plan data, just metadata
      // In a real implementation, you'd fetch the actual plan data
      data: {
        metadata: { planName: plan.name },
        weeks: [],
        blocks: [],
        exerciseDefinitions: [],
        weekTypes: [],
      },
    })
    setIsJsonEditorOpen(true)
  }

  const handleJsonEditorClose = () => {
    setIsJsonEditorOpen(false)
    setPlanToViewJson(null)
  }

  const handleDeleteClick = (plan: { id: string; name: string }) => {
    setPlanToDelete(plan)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (planToDelete) {
      await removeLocalPlan(planToDelete.id)
      setIsDeleteDialogOpen(false)
      setPlanToDelete(null)
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
      </div>
    )
  }

  // Group plans by "Recent" and "Older"
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
                  onViewJson={handleViewJson}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </div>
        )}

        {olderPlans.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
              {olderPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onViewJson={handleViewJson}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* JSON Editor Dialog */}
      {isJsonEditorOpen && planToViewJson && (
        <JsonEditor
          isOpen={isJsonEditorOpen}
          onClose={handleJsonEditorClose}
          plan={planToViewJson}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{planToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface PlanCardProps {
  plan: {
    id: string
    name: string
    createdAt: string
    updatedAt: string
  }
  onViewJson: (plan: any) => void
  onDelete: (plan: { id: string; name: string }) => void
}

function PlanCard({ plan, onViewJson, onDelete }: PlanCardProps) {
  const createdDate = new Date(plan.createdAt)
  const updatedDate = new Date(plan.updatedAt)

  // Format dates as "X days/hours ago"
  const createdAgo = formatDistanceToNow(createdDate, { addSuffix: true })
  const updatedAgo = formatDistanceToNow(updatedDate, { addSuffix: true })

  // Check if the plan was updated recently (within the last 24 hours)
  const isRecentlyUpdated = Date.now() - updatedDate.getTime() < 24 * 60 * 60 * 1000

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover:bg-muted/10 relative group">
      <CardHeader className="pb-3 px-6 pt-6">
        <CardTitle className="line-clamp-1 font-oswald font-light uppercase tracking-wide">
          {plan.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-2">
          Created {createdAgo}
          {isRecentlyUpdated && (
            <Badge variant="secondary" className="ml-2">
              Recently Updated
            </Badge>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0 px-6">
        <p className="text-sm text-muted-foreground">Last viewed {updatedAgo}</p>
      </CardContent>
      <CardFooter className="pt-5 pb-6 px-6 flex justify-between items-center">
        <Link href={`/plan/${plan.id}`} className="flex-1 mr-2">
          <Button variant="outline" className="w-full group">
            View Plan
            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>

        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs px-2 text-muted-foreground hover:text-primary"
            onClick={() => onViewJson(plan)}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs px-2 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(plan)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
