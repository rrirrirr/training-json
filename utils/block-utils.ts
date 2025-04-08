import type { Week, BlockDefinition, TrainingPlanData } from "@/types/training-plan"

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
export function getBlockInfo(week: Week, trainingPlan: TrainingPlanData) {
  const block = getBlock(week, trainingPlan);
  
  // Start with defaults
  let blockInfo = {
    name: "",
    description: week.blockInfo || "", // Use legacy blockInfo if available
    focus: "",
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
      style: block.style || blockInfo.style
    };
  }
  
  // Apply week-specific style overrides if the week has deload or test flags
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
  
  return blockInfo;
}
