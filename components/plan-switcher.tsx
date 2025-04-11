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
// Added SidebarGroupLabel import
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Plan type definition
type Plan = {
  id: string | number
  name?: string
  metadata?: {
    planName?: string
    creationDate?: string | number
  }
  updatedAt?: string | number
}

// Props definition
type PlanSwitcherProps = {
  plans: Plan[]
  currentPlan: Plan | null
  isOpen: boolean // Keep isOpen as it might affect desktop layout/labels
  onSelectPlan: (plan: Plan) => void
  onEditPlan: (plan: Plan, e: React.MouseEvent) => void
  onDeletePlan: (plan: Plan, e: React.MouseEvent) => void
  onCreatePlan: () => void
}

// Helper functions
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

const getPlanItemDate = (plan: Plan): { label: string; value: string } => {
  if (plan?.metadata?.creationDate) {
    return { label: "Created", value: formatDisplayDate(plan.metadata.creationDate) }
  } else if (plan?.updatedAt) {
    return { label: "Updated", value: formatDisplayDate(plan.updatedAt) }
  }
  return { label: "Date", value: "N/A" }
}

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
    <SidebarMenu className="w-full">
      {/* == Desktop Dropdown Trigger == */}
      <div className="hidden md:flex w-full">
        <SidebarMenuItem className="flex items-center justify-center w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                data-sidebar="menu-button"
                size="lg"
                className="p-0 w-full"
                data-active={currentPlan ? "true" : "false"}
                aria-label="Select Plan"
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shrink-0">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                {isOpen && (
                  <>
                    <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                      <span className="truncate font-semibold">{currentPlanName}</span>
                    </div>
                    <ChevronsUpDown className="lucide lucide-chevrons-up-down ml-auto h-4 w-4 shrink-0" />
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[300px]" align="start">
              {Array.isArray(plans) && plans.length > 0 ? (
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
                                  className="h-8 w-8 text-primary -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
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
                                  className="h-8 w-8 text-destructive -translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 delay-75"
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
                })
              ) : (
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
      </div>

      {/* == Mobile List View == */}
      <div className="flex w-full flex-col space-y-1 md:hidden px-1">
        {/* Mobile-only Label Added */}
        <SidebarGroupLabel className="px-2 pt-1 pb-1 text-sm font-medium text-muted-foreground md:hidden">
          Plans
        </SidebarGroupLabel>

        {Array.isArray(plans) && plans.length > 0 ? (
          plans.map((plan) => {
            const displayDate = getPlanItemDate(plan)
            const planName = plan.metadata?.planName || plan.name || `Plan ${plan.id}`
            const isSelected = currentPlan?.id === plan.id

            return (
              <div
                key={plan.id}
                className={cn(
                  "flex items-center justify-between w-full rounded-md p-2",
                  // Reverted background color for selected item to bg-muted
                  isSelected ? "bg-muted" : "hover:bg-muted/50"
                )}
              >
                <div
                  className="flex-1 truncate mr-2 cursor-pointer"
                  onClick={() => onSelectPlan(plan)}
                >
                  {/* Use primary text color for selected item name for emphasis */}
                  <span className={cn("font-medium", isSelected && "text-primary")}>
                    {planName}
                  </span>
                  <div className={cn("text-xs", "text-muted-foreground")}>
                    {" "}
                    {/* Keep date always muted */}
                    {displayDate.label}: {displayDate.value}
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    // Reverted icon colors to default
                    className={cn("h-9 w-9", "text-primary")}
                    onClick={(e) => onEditPlan(plan, e)}
                    aria-label={`Edit JSON for ${planName}`}
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    // Reverted icon colors to default
                    className={cn("h-9 w-9", "text-destructive")}
                    onClick={(e) => onDeletePlan(plan, e)}
                    aria-label={`Delete ${planName}`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No plans available.
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-center mt-2" // Keep margin top
          size="sm"
          onClick={onCreatePlan}
        >
          <Plus className="mr-2 h-4 w-4" /> New Plan (Import JSON)
        </Button>
      </div>
    </SidebarMenu>
  )
}
