"use client"

import { useRouter } from "next/navigation"
import { ChevronDown, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePlanStore, type PlanMetadata } from "@/store/plan-store"
import { useEffect } from "react"

export function PlanSwitcher() {
  const router = useRouter()
  
  // Get data and actions from Zustand store
  const activePlanId = usePlanStore((state) => state.activePlanId)
  const planMetadataList = usePlanStore((state) => state.planMetadataList)
  const fetchPlanMetadata = usePlanStore((state) => state.fetchPlanMetadata)
  
  // Fetch metadata on mount if not already loaded
  useEffect(() => {
    if (planMetadataList.length === 0) {
      fetchPlanMetadata()
    }
  }, [planMetadataList.length, fetchPlanMetadata])
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch {
      return "Unknown date"
    }
  }
  
  // Handle plan selection
  const handleSelectPlan = (planId: string) => {
    if (planId === activePlanId) return
    router.push(`/plan/${planId}`)
  }
  
  // Find current plan name
  const currentPlan = planMetadataList.find(p => p.id === activePlanId)
  const currentPlanName = currentPlan?.name || "Select Plan"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-[180px] justify-between">
          <span className="truncate">{currentPlanName}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[240px]">
        {planMetadataList.length > 0 ? (
          <>
            {planMetadataList.map((plan) => (
              <DropdownMenuItem
                key={plan.id}
                onClick={() => handleSelectPlan(plan.id)}
              >
                <div className="flex w-full items-center">
                  {plan.id === activePlanId && (
                    <Check className="mr-2 h-4 w-4 text-primary" />
                  )}
                  {plan.id !== activePlanId && (
                    <div className="mr-2 h-4 w-4" />
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Updated: {formatDate(plan.updatedAt)}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        ) : (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            No plans available
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/')}>
          Create New Plan
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
