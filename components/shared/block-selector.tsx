"use client"

import { cn } from "@/lib/utils"
import type { MonthBlock } from "@/types/training-plan"
import { Button } from "@/components/ui/button"

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
  variant = "sidebar",
}: BlockSelectorProps) {
  return (
    <div className="p-4">
      <h2 className="justify-self-center text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        Block
      </h2>
      <div className="space-y-1">
        {blocks.map((block) => (
          <Button
            key={block.id}
            variant={selectedBlockId === block.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onSelectBlock(block.id)}
            className={cn(
              "w-full justify-center text-center", // Center by default (mobile-first)
              "md:justify-start md:text-left", // Align left on medium screens and up
              selectedBlockId !== block.id && "text-foreground hover:bg-muted"
            )}
          >
            {block.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
