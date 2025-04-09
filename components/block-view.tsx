"use client"

import type { MonthBlock, TrainingPlanData, BlockDefinition } from "@/types/training-plan"
import { useRef } from "react"
import WeeklyView from "./weekly-view"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { getThemeAwareColorClasses } from "@/utils/color-utils"

interface BlockViewProps {
  monthBlock: MonthBlock // Using MonthBlock for backward compatibility
  trainingPlan: TrainingPlanData
}

export default function BlockView({ monthBlock, trainingPlan }: BlockViewProps) {
  // Create refs for each week section
  const weekRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
  const { theme } = useTheme();
  
  // Get all weeks for this block
  const weeksInBlock = trainingPlan.weeks
    .filter((week) => monthBlock.weeks.includes(week.weekNumber))
    .sort((a, b) => a.weekNumber - b.weekNumber)

  // Get block definition if it exists
  const findBlockDefinition = (): BlockDefinition | undefined => {
    if (!trainingPlan.blocks) return undefined;
    
    // First, try to find block by checking if any week in this block has a blockId
    if (weeksInBlock.length > 0) {
      const firstWeek = weeksInBlock[0];
      if (firstWeek.blockId) {
        return trainingPlan.blocks.find(block => block.id === firstWeek.blockId);
      }
    }
    
    // Fallback: try to match by name (if blockId isn't found)
    return trainingPlan.blocks.find(block => 
      block.name === monthBlock.name || 
      (block.description && monthBlock.name.includes(block.description))
    );
  };
  
  const blockDefinition = findBlockDefinition();
  
  // Get styling information
  const getBlockStyles = () => {
    // First, determine the colorName to use (prioritize monthBlock's colorName)
    let colorName = monthBlock.style?.colorName || blockDefinition?.style?.colorName;
    
    // Get theme-aware colors if colorName is set
    const colorClasses = getThemeAwareColorClasses(colorName, theme);
    
    // For backward compatibility, also handle direct color values
    let styles: React.CSSProperties = {};
    let bgClass = "";
    let borderClass = "";
    let textClass = "";
    
    // Only process these if colorName is not set
    if (!colorName) {
      // Apply monthBlock style (backward compatibility)
      if (monthBlock.style) {
        if (monthBlock.style.backgroundColor) {
          if (monthBlock.style.backgroundColor.startsWith('#') || 
              monthBlock.style.backgroundColor.startsWith('rgb')) {
            styles.backgroundColor = monthBlock.style.backgroundColor;
          } else {
            bgClass = `bg-${monthBlock.style.backgroundColor}`;
          }
        }
        
        if (monthBlock.style.borderColor) {
          if (monthBlock.style.borderColor.startsWith('#') || 
              monthBlock.style.borderColor.startsWith('rgb')) {
            styles.borderColor = monthBlock.style.borderColor;
          } else {
            borderClass = `border-${monthBlock.style.borderColor}`;
          }
        }
        
        if (monthBlock.style.textColor) {
          if (monthBlock.style.textColor.startsWith('#') || 
              monthBlock.style.textColor.startsWith('rgb')) {
            styles.color = monthBlock.style.textColor;
          } else {
            textClass = `text-${monthBlock.style.textColor}`;
          }
        }
      }
      
      // Override with blockDefinition style if available
      if (blockDefinition?.style) {
        if (blockDefinition.style.backgroundColor) {
          if (blockDefinition.style.backgroundColor.startsWith('#') || 
              blockDefinition.style.backgroundColor.startsWith('rgb')) {
            styles.backgroundColor = blockDefinition.style.backgroundColor;
          } else {
            bgClass = `bg-${blockDefinition.style.backgroundColor}`;
          }
        }
        
        if (blockDefinition.style.borderColor) {
          if (blockDefinition.style.borderColor.startsWith('#') || 
              blockDefinition.style.borderColor.startsWith('rgb')) {
            styles.borderColor = blockDefinition.style.borderColor;
          } else {
            borderClass = `border-${blockDefinition.style.borderColor}`;
          }
        }
        
        if (blockDefinition.style.textColor) {
          if (blockDefinition.style.textColor.startsWith('#') || 
              blockDefinition.style.textColor.startsWith('rgb')) {
            styles.color = blockDefinition.style.textColor;
          } else {
            textClass = `text-${blockDefinition.style.textColor}`;
          }
        }
      }
    }
    
    return { colorName, colorClasses, styles, bgClass, borderClass, textClass };
  };
  
  const { colorName, colorClasses, styles, bgClass, borderClass, textClass } = getBlockStyles();

  // Function to scroll to a specific week
  const scrollToWeek = (weekNumber: number) => {
    if (weekRefs.current[weekNumber]) {
      weekRefs.current[weekNumber]?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (weeksInBlock.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Inga veckor hittades för detta block</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-8">
      {/* Block header - made smaller and similar to week cards */}
      <div className={cn(
        "py-3 px-4 rounded-lg border-2 mb-8 max-w-4xl mx-auto shadow-sm",
        // Use new theme-aware styling if colorName is set
        colorName && colorClasses?.bg,
        colorName && colorClasses?.border,
        colorName && colorClasses?.text,
        // Use legacy styling as fallback
        !colorName && (bgClass || "bg-card"),
        !colorName && (borderClass || "border-primary/20")
      )} style={!colorName ? styles : undefined}>
        <div className="md:flex md:justify-between md:items-start">
          <div className="mb-3 md:mb-0">
            <h2 className="text-xl font-bold mb-1">{blockDefinition?.name || monthBlock.name}</h2>
            
            {blockDefinition?.focus && (
              <div className="text-base font-medium">
                <span className="text-muted-foreground">Fokus:</span> {blockDefinition.focus}
              </div>
            )}
            
            {blockDefinition?.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {blockDefinition.description}
              </p>
            )}
          </div>
          
          {blockDefinition?.durationWeeks && (
            <div className="text-sm bg-primary/5 px-3 py-1 rounded-md inline-block">
              {blockDefinition.durationWeeks} veckor
            </div>
          )}
        </div>
        
        {/* Clickable week links */}
        <div className="mt-3 flex flex-wrap gap-2">
          {weeksInBlock.map(week => (
            <button
              key={week.weekNumber}
              onClick={() => scrollToWeek(week.weekNumber)}
              className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                "bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary/40"
              )}
            >
              Vecka {week.weekNumber}
              {week.weekType && week.weekType !== "-" && ` (${week.weekType})`}
            </button>
          ))}
        </div>
      </div>

      {/* Week sections with refs for scrolling */}
      {weeksInBlock.map((week) => (
        <div 
          key={week.weekNumber} 
          ref={el => weekRefs.current[week.weekNumber] = el}
          id={`week-${week.weekNumber}`}
        >
          <WeeklyView week={week} trainingPlan={trainingPlan} compact={true} />
        </div>
      ))}
    </div>
  )
}