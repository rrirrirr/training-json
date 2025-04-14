"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { WeekType } from "@/types/training-plan"
import { cn } from "@/lib/utils"
import { getThemeAwareColorClasses } from "@/utils/color-utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WeekTypeLegendProps {
  weekTypes: WeekType[]
  className?: string
}

export default function WeekTypeLegend({ weekTypes, className }: WeekTypeLegendProps) {
  const { theme } = useTheme()
  const [open, setOpen] = React.useState(false)

  if (!weekTypes || weekTypes.length === 0) {
    return null
  }

  // If 4 or fewer week types, display them directly
  if (weekTypes.length <= 4) {
    return (
      <div className={cn("space-y-2", className)}>
        {weekTypes.map((weekType) => {
          const colorClasses = getThemeAwareColorClasses(weekType.colorName, theme)
          
          return (
            <div key={weekType.id} className="flex items-center">
              <div 
                className={cn(
                  "w-4 h-4 border-l-4 mr-2 shrink-0", 
                  colorClasses?.border || `border-${weekType.colorName}-500`
                )}
                title={weekType.description}
              />
              <span>{weekType.name} week</span>
            </div>
          )
        })}
      </div>
    )
  }

  // If more than 4 week types, show a button that opens a modal
  return (
    <>
      <div className={cn("space-y-2", className)}>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => setOpen(true)}
        >
          View Week Type Legend
        </Button>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Week Type Legend</DialogTitle>
            <DialogDescription>
              Overview of all week types in the current plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {weekTypes.map((weekType) => {
              const colorClasses = getThemeAwareColorClasses(weekType.colorName, theme)
              
              return (
                <div key={weekType.id} className="flex items-center">
                  <div 
                    className={cn(
                      "w-4 h-4 border-l-4 mr-2 shrink-0", 
                      colorClasses?.border || `border-${weekType.colorName}-500`
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{weekType.name} week</span>
                    {weekType.description && (
                      <span className="text-sm text-muted-foreground">{weekType.description}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}