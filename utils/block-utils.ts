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
 * Gets the block info details with theme-aware styling
 */
export function getBlockInfo(week: Week, trainingPlan: TrainingPlanData, theme?: string) {
  const block = getBlock(week, trainingPlan);
  
  // Start with defaults
  let blockInfo = {
    name: "",
    description: "",
    focus: "",
    colorName: undefined as ColorName | undefined
  };
  
  // Apply block data if available
  if (block) {
    blockInfo = {
      ...blockInfo,
      name: block.name,
      description: block.description || "",
      focus: block.focus,
      colorName: block.style?.colorName
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
  
  // Get theme-aware color classes
  const colorClasses = getThemeAwareColorClasses(blockInfo.colorName, theme);
  
  return {
    ...blockInfo,
    colorClasses
  };
}