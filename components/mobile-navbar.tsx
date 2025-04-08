// components/mobile-navbar.tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import type { MonthBlock } from "@/types/training-plan"
import { cn } from "@/lib/utils"

interface MobileNavBarProps {
  months: MonthBlock[] // Still using MonthBlock for backward compatibility
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

  // Handle previous week navigation
  const handlePrevWeek = () => {
    const currentWeekIndex = weeks.findIndex((w) => w === selectedWeek)
    if (selectedWeek !== null && currentWeekIndex > 0) {
      onWeekChange(weeks[currentWeekIndex - 1])
    }
  }

  // Handle next week navigation
  const handleNextWeek = () => {
    const currentWeekIndex = weeks.findIndex((w) => w === selectedWeek)
    if (selectedWeek !== null && currentWeekIndex < weeks.length - 1) {
      onWeekChange(weeks[currentWeekIndex + 1])
    }
  }

  // Handle selection from the sheet
  const handleSheetSelection = (blockId: number, weekId: number | null) => {
    onJumpToSelection(blockId, weekId)
    setIsSheetOpen(false) // Close sheet after selection
  }

  // Display text for the main button
  const mainButtonText = selectedWeek !== null 
    ? `Vecka ${selectedWeek}` 
    : `Block ${selectedMonth}`

  return (
    <div className="md:hidden p-2 border-b bg-white flex items-center justify-between space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevWeek}
        disabled={selectedWeek === null || selectedWeek === weeks[0]}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="flex-grow text-center">
            {mainButtonText}
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle>Välj period</SheetTitle>
          </SheetHeader>
          <Tabs defaultValue="blocks" className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="blocks">Block</TabsTrigger>
              <TabsTrigger value="weeks">Veckor</TabsTrigger>
            </TabsList>
            {/* Block Selection List */}
            <TabsContent value="blocks" className="flex-1 overflow-y-auto">
              <div className="space-y-1">
                {months.map((block) => (
                  <button
                    key={block.id}
                    onClick={() => handleSheetSelection(block.id, null)}
                    className={cn(
                      "w-full text-left p-2 rounded-md text-sm hover:bg-accent",
                      selectedMonth === block.id && selectedWeek === null
                        ? "bg-accent font-semibold"
                        : ""
                    )}
                  >
                    {block.name}
                  </button>
                ))}
              </div>
            </TabsContent>
            {/* Week Selection List */}
            <TabsContent value="weeks" className="flex-1 overflow-y-auto">
              <div className="space-y-1">
                {weeks.map((week) => (
                  <button
                    key={week}
                    onClick={() => handleSheetSelection(selectedMonth, week)}
                    className={cn(
                      "w-full text-left p-2 rounded-md text-sm hover:bg-accent",
                      selectedWeek === week ? "bg-accent font-semibold" : ""
                    )}
                  >
                    Vecka {week}
                  </button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <Button
        variant="outline"
        size="icon"
        onClick={handleNextWeek}
        disabled={selectedWeek === null || selectedWeek === weeks[weeks.length - 1]}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
