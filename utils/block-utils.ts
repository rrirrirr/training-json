import type { Week, BlockDefinition, TrainingPlanData, ColorName } from "@/types/training-plan"
import { getThemeAwareColorClasses } from "@/utils/color-utils"

/**
 * Gets the block definition for a week based on its blockId
 */
export function getBlock(
  week: Week,
  trainingPlan: TrainingPlanData,
): BlockDefinition | undefined {
  // Check if blocks array exists
  if (!trainingPlan.blocks) {
    return undefined;
  }
  
  // Find the block from the blockId
  return trainingPlan.blocks.find(block => block.id === week.blockId);
}

/**
 * Gets the block info details combining both new and legacy data
 */
export function getBlockInfo(week: Week, trainingPlan: TrainingPlanData, theme?: string) {
  const block = getBlock(week, trainingPlan);
  
  // Start with defaults
  let blockInfo = {
    name: "",
    description: week.blockInfo || "", // Use legacy blockInfo if available
    focus: "",
    colorName: undefined as ColorName | undefined,
    style: {
      backgroundColor: "",
      borderColor: "",
      textColor: ""
    }
  };
  
  // Apply block data if available
  if (block) {
    blockInfo = {
      ...blockInfo,
      name: block.name,
      description: block.description || blockInfo.description,
      focus: block.focus,
      colorName: block.style?.colorName,
      style: block.style || blockInfo.style
    };
  }
  
  // Special cases for deload and test weeks
  let specialColorName: ColorName | undefined;
  
  // Apply week-specific style overrides if the week has deload or test flags
  if (week.isDeload) {
    specialColorName = "yellow";
  } else if (week.isTest) {
    specialColorName = "green";
  }
  
  // If the week has its own style, it overrides the block style
  if (week.weekStyle?.colorName) {
    blockInfo.colorName = week.weekStyle.colorName;
  } else if (specialColorName) {
    blockInfo.colorName = specialColorName;
  }
  
  // For backward compatibility, also set the direct style properties
  if (week.isDeload) {
    blockInfo.style = {
      ...blockInfo.style,
      backgroundColor: "yellow-50",
      borderColor: "yellow-200",
      textColor: "yellow-800"
    };
  } else if (week.isTest) {
    blockInfo.style = {
      ...blockInfo.style,
      backgroundColor: "green-50",
      borderColor: "green-200",
      textColor: "green-800"
    };
  }
  
  // Get theme-aware color classes
  const colorClasses = getThemeAwareColorClasses(blockInfo.colorName, theme);
  
  return {
    ...blockInfo,
    colorClasses
  };
}