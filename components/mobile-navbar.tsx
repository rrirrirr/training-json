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
import { useState } from "react"
import type { MonthBlock, Week } from "@/types/training-plan"
import { cn } from "@/lib/utils"
import { useTrainingPlans } from "@/contexts/training-plan-context"
import BlockSelector from "@/components/shared/block-selector"
import WeekSelector from "@/components/shared/week-selector"
import { Info, PanelBottom } from "lucide-react"

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
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const { trainingData } = useTrainingPlans()

  // Function to get week type and status
  const getWeekInfo = (weekNumber: number) => {
    const weekData = trainingData.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      isDeload: weekData?.isDeload || false,
      isTest: weekData?.isTest || false,
    }
  }

  // Handle selection from the sheet
  const handleSheetSelection = (blockId: number, weekId: number | null) => {
    onJumpToSelection(blockId, weekId)
    setIsSheetOpen(false) // Close sheet after selection
  }

  // Display text for the main button
  const mainButtonText = selectedWeek !== null ? `Vecka ${selectedWeek}` : `Block ${selectedMonth}`

  // Get the current month name
  const currentMonthName =
    months.find((m) => m.id === selectedMonth)?.name || `Block ${selectedMonth}`

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="flex-grow flex items-center w-full px-4" // Kept flex, items-center, w-full, px-4. Removed justify-between.
        >
          <span className="flex-grow text-center">{mainButtonText}</span>
          <PanelBottom className="h-4 w-4 ml-2" /> {/* Added ml-2 for spacing */}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0">
        <SheetHeader className="p-4 pb-2 border-b">
          <SheetTitle>Träningsplan</SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="blocks" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-4 my-2 w-auto">
            <TabsTrigger className="flex-grow" value="blocks">
              Block
            </TabsTrigger>
            <TabsTrigger className="flex-grow" value="weeks">
              Veckor
            </TabsTrigger>
          </TabsList>

          {/* Block Selection Tab */}
          <TabsContent value="blocks" className="flex-1 overflow-y-auto pt-0">
            <BlockSelector
              blocks={months}
              selectedBlockId={selectedMonth}
              onSelectBlock={(blockId) => handleSheetSelection(blockId, null)}
              variant="mobile"
            />
          </TabsContent>

          {/* Week Selection Tab */}
          <TabsContent value="weeks" className="flex-1 overflow-y-auto pt-0">
            <WeekSelector
              weeks={weeks}
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
            <span>DELOAD week</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 border-l-4 border-green-500 mr-2"></div>
            <span>TEST week</span>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
