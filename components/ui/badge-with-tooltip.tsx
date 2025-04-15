"use client"
import React from "react"
import { Badge, BadgeProps } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export interface BadgeWithTooltipProps extends BadgeProps {
  tooltipContent: React.ReactNode
  tooltipSide?: "top" | "right" | "bottom" | "left"
  tooltipAlign?: "start" | "center" | "end"
  delayDuration?: number
}

export function BadgeWithTooltip({
  children,
  tooltipContent,
  tooltipSide = "top", 
  tooltipAlign = "center",
  delayDuration = 300,
  className,
  ...badgeProps
}: BadgeWithTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={delayDuration}>
        <TooltipTrigger asChild>
          <Badge className={cn("select-none", className)} {...badgeProps}>{children}</Badge>
        </TooltipTrigger>
        <TooltipContent side={tooltipSide} align={tooltipAlign}>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
