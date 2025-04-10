"use client"

import { useUIState } from "@/contexts/ui-context"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BlockSelector from "@/components/shared/block-selector"
import WeekSelector from "@/components/shared/week-selector"

export function MobileNav() {
  const { isMobileNavOpen, closeMobileNav } = useUIState()
  
  const {
    monthsForSidebar,
    weeksForSidebar,
    selectedMonth,
    selectedWeek,
    selectWeek,
    selectMonth,
    trainingData,
    viewMode, // Get the current view mode
  } = useTrainingPlans()

  // Function to get week type and status
  const getWeekInfo = (weekNumber: number) => {
    const weekData = trainingData.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      isDeload: weekData?.isDeload || false,
      isTest: weekData?.isTest || false,
      colorName: 
        weekData?.weekStyle?.colorName || 
        (weekData?.isDeload ? "yellow" : weekData?.isTest ? "green" : undefined),
    }
  }

  // Handle selection from the sheet
  const handleSheetSelection = (blockId: number, weekId: number | null) => {
    if (weekId !== null) {
      selectWeek(weekId)
    } else {
      selectMonth(blockId)
    }
    closeMobileNav()
  }
  
  // Set the default tab based on the current view mode
  const defaultTab = viewMode === "week" ? "weeks" : "blocks"

  return (
    <Sheet open={isMobileNavOpen} onOpenChange={(open) => !open && closeMobileNav()}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0 pb-safe" hideCloseButton>
        <SheetHeader className="px-6 py-3 border-b">
          <SheetTitle className="text-center">
            {viewMode === "week" ? "Browse Weeks" : "Browse Blocks"}
          </SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 my-3 w-auto">
            <TabsTrigger className="flex-grow" value="blocks">
              Blocks
            </TabsTrigger>
            <TabsTrigger className="flex-grow" value="weeks">
              Weeks
            </TabsTrigger>
          </TabsList>

          {/* Block Selection Tab */}
          <TabsContent value="blocks" className="flex-1 overflow-y-auto px-4 pt-2">
            <BlockSelector
              blocks={monthsForSidebar}
              selectedBlockId={selectedMonth}
              onSelectBlock={(blockId) => handleSheetSelection(blockId, null)}
              variant="mobile"
            />
          </TabsContent>

          {/* Week Selection Tab */}
          <TabsContent value="weeks" className="flex-1 overflow-y-auto px-4 pt-2">
            <WeekSelector
              weeks={weeksForSidebar}
              selectedWeek={selectedWeek}
              onSelectWeek={(weekId) => handleSheetSelection(selectedMonth, weekId)}
              variant="mobile"
              getWeekInfo={getWeekInfo}
            />
          </TabsContent>
        </Tabs>

        {/* Legend for week colors */}
        <SheetFooter className="p-4 border-t flex-row justify-start gap-4 text-xs text-muted-foreground">
          <div className="flex items-center">
            <div className="w-4 h-4 border-l-4 border-yellow-500 mr-2"></div>
            <span>DELOAD Week</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 border-l-4 border-green-500 mr-2"></div>
            <span>TEST Week</span>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}