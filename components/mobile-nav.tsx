"use client"

import { useUIState } from "@/contexts/ui-context"
import { usePlanStore } from "@/store/plan-store"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BlockSelector from "@/components/shared/block-selector"
import WeekSelector from "@/components/shared/week-selector"
import WeekTypeLegend from "./week-type-legend"
import { useEffect, useState } from "react"
import type { WeekType, TrainingPlanData } from "@/types/training-plan"

export function MobileNav() {
  const { isMobileNavOpen, closeMobileNav } = useUIState()

  const mode = usePlanStore((state) => state.mode)
  const draftPlan = usePlanStore((state) => state.draftPlan)
  const activePlanFromStore = usePlanStore((state) => state.activePlan)

  const selectedBlock = usePlanStore((state) => state.selectedBlock)
  const selectedWeek = usePlanStore((state) => state.selectedWeek)
  const viewMode = usePlanStore((state) => state.viewMode)
  const selectWeek = usePlanStore((state) => state.selectWeek)
  const selectBlock = usePlanStore((state) => state.selectBlock)

  const planToDisplay: TrainingPlanData | null | undefined =
    mode !== "normal" ? draftPlan : activePlanFromStore

  const blocksForSidebar = planToDisplay?.blocks || []
  const weeksForSidebar = planToDisplay?.weeks?.map((w) => w.weekNumber).sort((a, b) => a - b) || []
  const trainingData = planToDisplay?.weeks || []

  const [weekTypes, setWeekTypes] = useState<WeekType[]>([])

  useEffect(() => {
    if (planToDisplay?.weekTypes && Array.isArray(planToDisplay.weekTypes)) {
      setWeekTypes(planToDisplay.weekTypes)
    } else {
      setWeekTypes([])
    }
  }, [planToDisplay])

  const getWeekInfo = (weekNumber: number) => {
    const weekData = trainingData.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      weekTypeIds: weekData?.weekTypeIds || [],
      colorName: weekData?.weekStyle?.colorName,
    }
  }

  const handleSheetSelection = (blockId: number, weekId: number | null) => {
    if (weekId !== null) {
      selectWeek(weekId)
    } else {
      selectBlock(blockId)
    }
    closeMobileNav()
  }

  const defaultTab = viewMode === "week" ? "weeks" : "blocks"

  if (!planToDisplay) {
    return (
      <Sheet open={isMobileNavOpen} onOpenChange={(open) => !open && closeMobileNav()}>
        <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0 pb-safe" hideCloseButton>
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-muted-foreground">No plan data available to display.</p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={isMobileNavOpen} onOpenChange={(open) => !open && closeMobileNav()}>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0 pb-safe" hideCloseButton>
        <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 my-3 w-auto">
            <TabsTrigger className="flex-grow" value="blocks">
              Blocks
            </TabsTrigger>
            <TabsTrigger className="flex-grow" value="weeks">
              Weeks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blocks" className="flex-1 overflow-y-auto px-4 pt-2">
            <BlockSelector
              blocks={blocksForSidebar}
              selectedBlockId={selectedBlock}
              onSelectBlock={(blockId) => handleSheetSelection(blockId, null)}
              variant="mobile"
            />
          </TabsContent>

          <TabsContent value="weeks" className="flex-1 overflow-y-auto px-4 pt-2">
            <WeekSelector
              weeks={weeksForSidebar}
              selectedWeek={selectedWeek}
              onSelectWeek={(weekId) => handleSheetSelection(selectedBlock, weekId)}
              variant="mobile"
              getWeekInfo={getWeekInfo}
            />
          </TabsContent>
        </Tabs>

        <SheetFooter className="p-4 border-t">
          <WeekTypeLegend weekTypes={weekTypes} />
          {(!weekTypes || weekTypes.length === 0) && (
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center">
                <div className="w-4 h-4 border-l-4 border-yellow-500 mr-2"></div>
                <span>DELOAD Week</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 border-l-4 border-green-500 mr-2"></div>
                <span>TEST Week</span>
              </div>
            </div>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
