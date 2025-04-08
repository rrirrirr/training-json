"use client"

import { cn } from "@/lib/utils"
import type { MonthBlock } from "@/types/training-plan"

interface BlockSelectorProps {
  blocks: MonthBlock[]
  selectedBlockId: number
  onSelectBlock: (blockId: number) => void
  variant?: "sidebar" | "mobile"
}

export default function BlockSelector({
  blocks,
  selectedBlockId,
  onSelectBlock,
  variant = "sidebar"
}: BlockSelectorProps) {
  // Determine styling based on variant
  const getBlockButtonStyles = (isSelected: boolean) => {
    return cn(
      "w-full p-2 rounded text-left text-sm transition-colors",
      isSelected
        ? "bg-primary text-primary-foreground font-medium" 
        : "hover:bg-muted text-foreground"
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        Block
      </h2>
      <div className="space-y-1">
        {blocks.map((block) => (
          <button
            key={block.id}
            onClick={() => onSelectBlock(block.id)}
            className={getBlockButtonStyles(selectedBlockId === block.id)}
          >
            {block.name}
          </button>
        ))}
      </div>
    </div>
  )
}