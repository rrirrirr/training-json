// Example: components/MobileNavBar.tsx
"use client"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import type { MonthBlock } from "@/types/training-plan"
import { cn } from "@/lib/utils"

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

  // --- Prev/Next handlers (same as before) ---
  const handlePrevWeek = () => {
    const currentWeekIndex = weeks.findIndex((w) => w === selectedWeek)
    if (selectedWeek !== null && currentWeekIndex > 0) {
      onWeekChange(weeks[currentWeekIndex - 1])
    }
  }

  const handleNextWeek = () => {
    const currentWeekIndex = weeks.findIndex((w) => w === selectedWeek)
    if (selectedWeek !== null && currentWeekIndex < weeks.length - 1) {
      onWeekChange(weeks[currentWeekIndex + 1])
    }
  }

  // --- Sheet selection handler (same as before) ---
  const handleSheetSelection = (monthId: number, weekId: number | null) => {
    onJumpToSelection(monthId, weekId)
    setIsSheetOpen(false) // Close sheet after selection
  }

  // --- Main button text (same as before) ---
  const mainButtonText = selectedWeek !== null ? `Vecka ${selectedWeek}` : `Månad ${selectedMonth}`

  return (
    // --- Navbar structure (same as before) ---
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
        {/* Updated SheetContent structure */}
        <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0">
          {" "}
          {/* Remove padding for edge-to-edge Tabs */}
          <SheetHeader className="p-6 pb-2">
            {" "}
            {/* Add padding back to header */}
            <SheetTitle>Select Period</SheetTitle>
          </SheetHeader>
          {/* Tabs component taking remaining space */}
          {/* Default Tabs orientation is horizontal TabsList above TabsContent */}
          <Tabs defaultValue="months" className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
            {" "}
            {/* Add padding back, allow flex col */}
            {/* TabsList will render horizontally by default */}
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="months">Months</TabsTrigger>
              <TabsTrigger value="weeks">Weeks</TabsTrigger>
            </TabsList>
            {/* Month Selection List - now takes remaining space and scrolls */}
            <TabsContent value="months" className="flex-1 overflow-y-auto">
              <div className="space-y-1">
                {months.map((month) => (
                  <button
                    key={month.id}
                    onClick={() => handleSheetSelection(month.id, null)}
                    className={cn(
                      "w-full text-left p-2 rounded-md text-sm hover:bg-accent",
                      selectedMonth === month.id && selectedWeek === null
                        ? "bg-accent font-semibold"
                        : ""
                    )}
                  >
                    {month.name}
                  </button>
                ))}
              </div>
            </TabsContent>
            {/* Week Selection List - now takes remaining space and scrolls */}
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
          {/* Footer removed as selection closes sheet */}
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
