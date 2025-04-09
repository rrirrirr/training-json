"use client"

import * as React from "react"
import { GalleryVerticalEnd, ChevronsUpDown, FileText, Trash2, Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Represents a training plan structure.
 */
type Plan = {
  id: string | number
  name?: string
  metadata?: {
    planName?: string
    creationDate?: string | number
  }
  updatedAt?: string | number
}

/**
 * Props for the PlanSwitcher component.
 */
type PlanSwitcherProps = {
  plans: Plan[]
  currentPlan: Plan | null
  isOpen: boolean
  onSelectPlan: (plan: Plan) => void
  onEditPlan: (plan: Plan, e: React.MouseEvent) => void
  onDeletePlan: (plan: Plan, e: React.MouseEvent) => void
  onCreatePlan: () => void
}

/**
 * Formats a date input (string or timestamp) into<y_bin_46>-MM-DD format.
 * @param dateInput - The date string or timestamp.
 * @returns Formatted date string or error message.
 */
const formatDisplayDate = (dateInput: string | number | undefined): string => {
  if (!dateInput) return "No date"
  try {
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return "Invalid date"
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid date format"
  }
}

/**
 * Determines the display date (Created or Updated) for a plan item.
 * @param plan - The plan object.
 * @returns Object containing the date label and formatted value.
 */
const getPlanItemDate = (plan: Plan): { label: string; value: string } => {
  if (plan?.metadata?.creationDate) {
    return { label: "Created", value: formatDisplayDate(plan.metadata.creationDate) }
  } else if (plan?.updatedAt) {
    return { label: "Updated", value: formatDisplayDate(plan.updatedAt) }
  }
  return { label: "Date", value: "N/A" }
}

/**
 * A component for switching between available training plans within the sidebar.
 */
export function PlanSwitcher({
  plans = [],
  currentPlan,
  isOpen,
  onSelectPlan,
  onEditPlan,
  onDeletePlan,
  onCreatePlan,
}: PlanSwitcherProps) {
  const currentPlanName = currentPlan?.metadata?.planName || currentPlan?.name || "Select Plan"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              data-sidebar="menu-button"
              size="lg"
              className="p-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" // Added hover classes back
              data-active={currentPlan ? "true" : "false"}
              aria-label="Select Plan"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
                <GalleryVerticalEnd className="size-4" />
              </div>
              {isOpen && (
                <>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{currentPlanName}</span>
                  </div>
                  <ChevronsUpDown className="lucide lucide-chevrons-up-down ml-auto h-4 w-4 shrink-0" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[300px]" align="start">
            {Array.isArray(plans) &&
              plans.map((plan) => {
                const displayDate = getPlanItemDate(plan)
                const planName = plan.metadata?.planName || plan.name || `Plan ${plan.id}`
                const isSelected = currentPlan?.id === plan.id

                return (
                  <DropdownMenuItem key={plan.id} asChild onSelect={(e) => e.preventDefault()}>
                    <div className="flex items-center justify-between w-full cursor-pointer px-2 py-1.5 group relative overflow-hidden">
                      <div className="w-5 mr-2 flex-shrink-0">
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 truncate mr-2" onClick={() => onSelectPlan(plan)}>
                        {planName}
                        <div className="text-xs text-muted-foreground">
                          {displayDate.label}: {displayDate.value}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" // Restored animation & theme color
                                onClick={(e) => onEditPlan(plan, e)}
                                aria-label={`Edit JSON for ${planName}`}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Edit JSON</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 delay-75" // Restored animation
                                onClick={(e) => onDeletePlan(plan, e)}
                                aria-label={`Delete ${planName}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Delete Plan</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </DropdownMenuItem>
                )
              })}
            {(!Array.isArray(plans) || plans.length === 0) && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No plans available.</div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onCreatePlan}>
              <Button
                variant="ghost"
                className="w-full justify-start px-2 text-muted-foreground"
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" /> New Plan (Import JSON)
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
