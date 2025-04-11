"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import type { MonthBlock, Week, WeekType } from "@/types/training-plan"
import { cn } from "@/lib/utils"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import BlockSelector from "@/components/shared/block-selector"
import WeekSelector from "@/components/shared/week-selector"
import WeekTypeLegend from "./week-type-legend"
import { ChevronDown, Info, PanelBottom } from "lucide-react"

interface MobileNavBarProps {
  months: MonthBlock[]
  weeks: number[]
  selectedMonth: number
  selectedWeek: number | null
  onWeekChange: (newWeek: number) => void
  onJumpToSelection: (monthId: number, weekId: number | null) => void
}

export function MobileNavBar({
  months,
  weeks,
  selectedMonth,
  selectedWeek,
  onWeekChange,
  onJumpToSelection,
}: MobileNavBarProps) {
  const { trainingData, currentPlan } = useTrainingPlans()
  
  // State for week types
  const [weekTypes, setWeekTypes] = useState<WeekType[]>([])
  
  // Get week types from current plan
  useEffect(() => {
    if (currentPlan?.data?.weekTypes && Array.isArray(currentPlan.data.weekTypes)) {
      setWeekTypes(currentPlan.data.weekTypes)
    } else {
      setWeekTypes([])
    }
  }, [currentPlan])

  // Function to get week type and status
  const getWeekInfo = (weekNumber: number) => {
    const weekData = trainingData.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      weekTypeIds: weekData?.weekTypeIds || [],
      colorName: weekData?.weekStyle?.colorName
    }
  }

  // Handle selection from the sheet
  const handleSheetSelection = (blockId: number, weekId: number | null) => {
    onJumpToSelection(blockId, weekId)
  }

  return (
    <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0 pb-safe" hideCloseButton>
      <Tabs defaultValue="blocks" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-6 my-4 w-auto">
          <TabsTrigger className="flex-grow" value="blocks">
            Block
          </TabsTrigger>
          <TabsTrigger className="flex-grow" value="weeks">
            Veckor
          </TabsTrigger>
        </TabsList>

        {/* Block Selection Tab */}
        <TabsContent value="blocks" className="flex-1 overflow-y-auto px-4 pt-2">
          <BlockSelector
            blocks={months}
            selectedBlockId={selectedMonth}
            onSelectBlock={(blockId) => handleSheetSelection(blockId, null)}
            variant="mobile"
          />
        </TabsContent>

        {/* Week Selection Tab */}
        <TabsContent value="weeks" className="flex-1 overflow-y-auto px-4 pt-2">
          <WeekSelector
            weeks={weeks}
            selectedWeek={selectedWeek}
            onSelectWeek={(weekId) => handleSheetSelection(selectedMonth, weekId)}
            variant="mobile"
            getWeekInfo={getWeekInfo}
          />
        </TabsContent>
      </Tabs>

      {/* Dynamic Week Type Legend */}
      <SheetFooter className="p-4 border-t">
        <WeekTypeLegend weekTypes={weekTypes} />
        
        {/* If no week types are defined, show the original static legend */}
        {(!weekTypes || weekTypes.length === 0) && (
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center">
              <div className="w-4 h-4 border-l-4 border-yellow-500 mr-2"></div>
              <span>DELOAD week</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 border-l-4 border-green-500 mr-2"></div>
              <span>TEST week</span>
            </div>
          </div>
        )}
      </SheetFooter>
    </SheetContent>
  )
}