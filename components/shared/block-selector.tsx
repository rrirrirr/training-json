"use client"

import { cn } from "@/lib/utils"
import type { Block } from "@/types/training-plan"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { getThemeAwareColorClasses } from "@/utils/color-utils"

interface BlockSelectorProps {
  blocks: Block[]
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
  const { theme } = useTheme()

  return (
    <div className="py-4" data-testid="block-view-container">
      <h2 className="justify-self-start text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
        Block
      </h2>
      <div className="space-y-1">
        {blocks.map((block) => {
          // Get theme-aware color classes if block has style with colorName
          const colorClasses = block.style?.colorName
            ? getThemeAwareColorClasses(block.style.colorName, theme)
            : null

          // Apply colorClasses only when not selected, otherwise use default styling
          const customColorStyle =
            selectedBlockId !== block.id && colorClasses
              ? {
                  className: colorClasses.grid,
                  textClassName: colorClasses.text,
                }
              : null

          return (
            <Button
              key={block.id}
              variant={selectedBlockId === block.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onSelectBlock(block.id)}
              className={cn(
                "w-full justify-center text-center", // Center by default (mobile-first)
                "md:justify-start md:text-left", // Align left on medium screens and up
                // Apply custom styling when not selected
                selectedBlockId !== block.id && customColorStyle?.className,
                selectedBlockId !== block.id && customColorStyle?.textClassName,
                // Default hover/focus behavior when no custom color
                selectedBlockId !== block.id &&
                  !customColorStyle &&
                  "text-foreground hover:bg-muted"
              )}
            >
              {block.name}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
