"use client"

import type { Block } from "@/types/training-plan"
import { Button } from "@/components/ui/button"
import { Calendar, List } from "lucide-react"

interface TabNavigationProps {
  blocks: Block[]
  selectedBlock: number
  onSelectBlock: (blockId: number) => void
  viewMode: "week" | "block"
  onViewModeChange: (mode: "week" | "block") => void
}

export default function TabNavigation({
  blocks,
  selectedBlock,
  onSelectBlock,
  viewMode,
  onViewModeChange,
}: TabNavigationProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 flex justify-between items-center">
        <nav className="flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {blocks.map((block) => (
            <button
              key={block.id}
              onClick={() => onSelectBlock(block.id)}
              className={`
                px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${
                  selectedBlock === block.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {block.name}
            </button>
          ))}
        </nav>

        <div className="flex space-x-2">
          <Button
            variant={viewMode === "block" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("block")}
            title="Blockvy"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewModeChange("week")}
            title="Veckovy"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}