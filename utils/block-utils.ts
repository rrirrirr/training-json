import type { Week, BlockDefinition, TrainingPlanData, ColorName, WeekType } from "@/types/training-plan"
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
 * Gets a week type by its ID
 */
export function getWeekType(
  weekTypeId: string,
  trainingPlan: TrainingPlanData,
): WeekType | undefined {
  // Check if weekTypes array exists
  if (!trainingPlan.weekTypes) {
    return undefined;
  }
  
  // Find the week type from the ID
  return trainingPlan.weekTypes.find(weekType => weekType.id === weekTypeId);
}

/**
 * Gets all week types assigned to a week
 */
export function getWeekTypes(
  week: Week,
  trainingPlan: TrainingPlanData,
): WeekType[] {
  // Initialize empty array if no week type IDs
  if (!week.weekTypeIds || !Array.isArray(week.weekTypeIds) || week.weekTypeIds.length === 0) {
    return [];
  }
  
  // If no week types defined in plan, return empty array
  if (!trainingPlan.weekTypes || !Array.isArray(trainingPlan.weekTypes)) {
    return [];
  }
  
  // Look up the week types from the trainingPlan
  return week.weekTypeIds
    .map(id => getWeekType(id, trainingPlan))
    .filter((weekType): weekType is WeekType => weekType !== undefined);
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
  
  // Get week types to check for special styling
  const weekTypes = getWeekTypes(week, trainingPlan);
  const hasSpecialType = weekTypes.length > 0;
  
  // If there are week types, use the first one's color for now
  // In a more advanced implementation, we might want to handle multiple types differently
  if (hasSpecialType && weekTypes[0]) {
    // Week type styling overrides block styling unless week has explicit styling
    if (!week.weekStyle?.colorName) {
      blockInfo.colorName = weekTypes[0].colorName;
    }
  }
  
  // If the week has its own style, it overrides everything
  if (week.weekStyle?.colorName) {
    blockInfo.colorName = week.weekStyle.colorName;
  }
  
  // Get theme-aware color classes
  const colorClasses = getThemeAwareColorClasses(blockInfo.colorName, theme);
  
  return {
    ...blockInfo,
    colorClasses,
    weekTypes  // Include the week types in the returned info
  };
}