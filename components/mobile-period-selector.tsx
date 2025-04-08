"use client"

import type { MonthBlock } from "@/types/training-plan" // Adjust path as needed
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useState } from "react" // Needed for temporary selections inside the sheet

interface MobilePeriodSelectorProps {
  months: MonthBlock[]
  // Pass all relevant weeks, or filter them based on selected month inside the parent
  weeks: number[]
  selectedMonth: number
  selectedWeek: number | null
  onConfirmSelection: (monthId: number, weekId: number | null) => void
  // Add other props like viewMode toggles if needed inside the sheet
}

export function MobilePeriodSelector({
  months,
  weeks,
  selectedMonth,
  selectedWeek,
  onConfirmSelection,
}: MobilePeriodSelectorProps) {
  // Temporary state for selections within the sheet before confirming
  const [tempSelectedMonth, setTempSelectedMonth] = useState<number>(selectedMonth)
  const [tempSelectedWeek, setTempSelectedWeek] = useState<number | null>(selectedWeek)

  // Function to handle confirmation
  const handleConfirm = () => {
    onConfirmSelection(tempSelectedMonth, tempSelectedWeek)
    // SheetClose will handle closing
  }

  // Filter weeks based on the tempSelectedMonth if necessary
  // This logic might be complex depending on your data structure
  const relevantWeeks = weeks // Replace with actual filtering logic if needed

  return (
    <Sheet>
      <SheetTrigger asChild>
        {/* Adjust button text/icon as desired */}
        <Button variant="outline" size="sm">
          Select Period
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        {" "}
        {/* Changed to bottom sheet, common for mobile */}
        <SheetHeader>
          <SheetTitle>Select Month and Week</SheetTitle>
        </SheetHeader>
        <div className="py-4 space-y-6 overflow-y-auto max-h-[70vh]">
          {" "}
          {/* Allow vertical scroll if content is long */}
          {/* Month Selection */}
          <div>
            <Label className="mb-2 block font-medium">Month/Block</Label>
            <RadioGroup
              value={tempSelectedMonth.toString()}
              onValueChange={(value) => setTempSelectedMonth(Number(value))}
            >
              {months.map((month) => (
                <div key={month.id} className="flex items-center space-x-2 mb-1">
                  <RadioGroupItem value={month.id.toString()} id={`month-${month.id}`} />
                  <Label htmlFor={`month-${month.id}`} className="font-normal">
                    {month.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          {/* Week Selection */}
          <div>
            <Label className="mb-2 block font-medium">Week</Label>
            <RadioGroup
              value={tempSelectedWeek?.toString() ?? ""} // Handle null selection
              onValueChange={(value) => setTempSelectedWeek(value ? Number(value) : null)}
            >
              {/* You might want a "None" or "All Weeks" option */}
              {/* <div className="flex items-center space-x-2 mb-1">
                 <RadioGroupItem value="" id="week-none" />
                 <Label htmlFor="week-none" className="font-normal">All Weeks</Label>
               </div> */}
              {relevantWeeks.map((week) => (
                <div key={week} className="flex items-center space-x-2 mb-1">
                  <RadioGroupItem value={week.toString()} id={`week-${week}`} />
                  <Label htmlFor={`week-${week}`} className="font-normal">
                    Vecka {week}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="button" onClick={handleConfirm}>
              Done
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
