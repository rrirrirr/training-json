import type { MonthBlock, TrainingPlanData, BlockDefinition } from "@/types/training-plan"
import WeeklyView from "./weekly-view"
import { cn } from "@/lib/utils"

interface BlockViewProps {
  monthBlock: MonthBlock // Using MonthBlock for backward compatibility
  trainingPlan: TrainingPlanData
}

export default function BlockView({ monthBlock, trainingPlan }: BlockViewProps) {
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
  
  // Get styling information from block definition or monthBlock
  const getBlockStyles = () => {
    // Start with empty styles
    const styles: React.CSSProperties = {};
    let bgClass = "";
    let borderClass = "";
    let textClass = "";
    
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
    
    return { styles, bgClass, borderClass, textClass };
  };
  
  const { styles, bgClass, borderClass, textClass } = getBlockStyles();

  if (weeksInBlock.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Inga veckor hittades för detta block</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 pb-8">
      <div className={cn(
        "py-4 px-6 rounded-lg border mb-8",
        bgClass || "bg-card",
        borderClass || "border-border",
        textClass
      )} style={styles}>
        <h2 className="text-2xl font-bold mb-2">{blockDefinition?.name || monthBlock.name}</h2>
        
        {blockDefinition?.focus && (
          <div className="text-lg font-medium mb-2">
            Fokus: {blockDefinition.focus}
          </div>
        )}
        
        {blockDefinition?.description && (
          <p className="text-muted-foreground">
            {blockDefinition.description}
          </p>
        )}
        
        {blockDefinition?.durationWeeks && (
          <div className="mt-2 text-sm">
            Duration: {blockDefinition.durationWeeks} veckor
          </div>
        )}
        
        <div className="mt-3 flex flex-wrap gap-2">
          {weeksInBlock.map(week => (
            <span key={week.weekNumber} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              Vecka {week.weekNumber}
              {week.weekType && week.weekType !== "-" && ` (${week.weekType})`}
            </span>
          ))}
        </div>
      </div>

      {weeksInBlock.map((week) => (
        <WeeklyView key={week.weekNumber} week={week} trainingPlan={trainingPlan} compact={true} />
      ))}
    </div>
  )
}