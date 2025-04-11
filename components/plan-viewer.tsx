'use client'

import { useState, useEffect } from 'react'
import { usePlanStore } from '@/store/plan-store'
import { Loader2 } from 'lucide-react'
import WeeklyView from '@/components/weekly-view'
import BlockView from '@/components/block-view'
import { useUIState } from '@/contexts/ui-context'
import { MobileScrollNav } from '@/components/mobile-scroll-nav'

export default function PlanViewer() {
  // Get plan data from Zustand store
  const activePlan = usePlanStore((state) => state.activePlan)
  
  // Local UI state
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number>(1)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month')

  // UI Context for mobile navigation
  const { openMobileNav } = useUIState()

  // Initialize view state based on the plan data
  useEffect(() => {
    if (activePlan?.monthBlocks && activePlan.monthBlocks.length > 0) {
      const firstMonth = activePlan.monthBlocks[0]
      setSelectedMonth(firstMonth.id)
      
      // If there are weeks, select the first week of the first month
      if (firstMonth.weeks && firstMonth.weeks.length > 0) {
        setSelectedWeek(firstMonth.weeks[0])
        setViewMode('week')
      } else {
        setSelectedWeek(null)
        setViewMode('month')
      }
    }
  }, [activePlan])

  // Actions for changing view state
  const selectWeek = (weekNumber: number) => {
    setSelectedWeek(weekNumber)
    setViewMode('week')
    
    // Find which month this week belongs to
    const month = activePlan?.monthBlocks.find(
      (block) => block.weeks.includes(weekNumber)
    )
    
    if (month && month.id !== selectedMonth) {
      setSelectedMonth(month.id)
    }
  }

  const selectMonth = (monthId: number) => {
    setSelectedMonth(monthId)
    setViewMode('month')
    setSelectedWeek(null)
  }

  const changeViewMode = (mode: 'week' | 'month') => {
    setViewMode(mode)
    
    if (mode === 'month') {
      setSelectedWeek(null)
    } else if (mode === 'week' && selectedWeek === null && activePlan) {
      // If switching to week view with no week selected,
      // select first week of current month
      const firstWeekOfMonth = activePlan.monthBlocks.find(
        (m) => m.id === selectedMonth
      )?.weeks[0]
      
      if (firstWeekOfMonth !== undefined) {
        setSelectedWeek(firstWeekOfMonth)
      }
    }
  }

  // If no plan is loaded yet, show a loading indicator
  if (!activePlan) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Find the data for the selected week/month
  const weekData = selectedWeek 
    ? activePlan.weeks.find((week) => week.weekNumber === selectedWeek)
    : null
    
  const monthData = activePlan.monthBlocks.find(
    (block) => block.id === selectedMonth
  )

  // Handle case where the plan exists but has no weeks
  if (activePlan.weeks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="text-center max-w-lg p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h2 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-4">
            Empty Plan
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            This training plan doesn't have any weeks defined yet. Edit the plan JSON or import a
            different one.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Content View with bottom padding on mobile */}
      <div className="p-4 pb-20 md:p-6 md:pb-6">
        {viewMode === "week" && weekData ? (
          <WeeklyView week={weekData} trainingPlan={activePlan} />
        ) : viewMode === "month" && monthData ? (
          <BlockView monthBlock={monthData} trainingPlan={activePlan} />
        ) : (
          // Fallback if data is somehow missing
          <div className="text-center p-8 text-muted-foreground">
            Please select a week or block to view.
          </div>
        )}
      </div>
      
      {/* Floating Mobile Nav Button */}
      <MobileScrollNav />
    </>
  )
}
