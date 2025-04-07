"use client"

import type { Week } from "@/types/training-plan"

interface SidebarProps {
  weeks: number[]
  selectedWeek: number | null
  onSelectWeek: (week: number) => void
  trainingData: Week[]
}

export default function Sidebar({ weeks, selectedWeek, onSelectWeek, trainingData }: SidebarProps) {
  // Function to get week type (A/B) and special status (deload/test)
  const getWeekInfo = (weekNumber: number) => {
    const weekData = trainingData.find((w) => w.weekNumber === weekNumber)
    return {
      type: weekData?.weekType || "",
      isDeload: weekData?.isDeload || false,
      isTest: weekData?.isTest || false,
    }
  }

  return (
    <div className="w-64 bg-gray-800 text-white overflow-auto shadow-lg">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Träningsplan</h1>
        <p className="text-sm text-gray-400">Veckoöversikt</p>
      </div>

      <nav className="p-2">
        <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 px-2">Veckor</h2>
        <div className="grid grid-cols-4 gap-2">
          {weeks.map((week) => {
            const { type, isDeload, isTest } = getWeekInfo(week)
            return (
              <button
                key={week}
                onClick={() => onSelectWeek(week)}
                className={`
                  p-2 rounded text-center text-sm transition-colors
                  ${selectedWeek === week ? "bg-blue-600 text-white" : "hover:bg-gray-700 text-gray-300"}
                  ${isDeload ? "border-l-4 border-yellow-500" : ""}
                  ${isTest ? "border-l-4 border-green-500" : ""}
                `}
              >
                <div className="font-medium">{week}</div>
                {type && <div className="text-xs opacity-75">{type}</div>}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="p-4 mt-4">
        <div className="flex items-center mb-2">
          <div className="w-4 h-4 border-l-4 border-yellow-500 mr-2"></div>
          <span className="text-xs text-gray-400">DELOAD vecka</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 border-l-4 border-green-500 mr-2"></div>
          <span className="text-xs text-gray-400">TEST vecka</span>
        </div>
      </div>
    </div>
  )
}

