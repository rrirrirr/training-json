import type { Session, SessionTypeDefinition, TrainingPlanData, ColorName } from "@/types/training-plan"
import { getThemeAwareColorClasses } from "@/utils/color-utils"

/**
 * Gets the session type definition for a session based on its sessionTypeId
 */
export function getSessionType(
  session: Session,
  trainingPlan: TrainingPlanData,
): SessionTypeDefinition | undefined {
  // Check if sessionTypes array exists
  if (!trainingPlan.sessionTypes) {
    return undefined;
  }
  
  // Find the session type from the sessionTypeId
  return trainingPlan.sessionTypes.find(type => type.id === session.sessionTypeId);
}

/**
 * Gets session styling information including theme-aware color classes
 */
export function getSessionStyling(session: Session, trainingPlan: TrainingPlanData, theme?: string) {
  const sessionType = getSessionType(session, trainingPlan);
  
  // Determine the color name (prioritize session style over session type)
  let colorName: ColorName | undefined;
  
  // Check session style for colorName first (highest priority)
  if (session.sessionStyle?.colorName) {
    colorName = session.sessionStyle.colorName;
  } 
  // Then check session type defaultStyle for colorName
  else if (sessionType?.defaultStyle?.colorName) {
    colorName = sessionType.defaultStyle.colorName;
  }
  
  // Get theme-aware colors based on the determined colorName
  const colorClasses = getThemeAwareColorClasses(colorName, theme);
  
  return {
    colorName,
    colorClasses,
    sessionTypeName: sessionType?.name || "Unknown"
  };
}