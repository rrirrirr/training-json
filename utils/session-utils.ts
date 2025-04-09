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
 * Combines styling from session type and session-specific style overrides
 */
export function getSessionStyling(session: Session, trainingPlan: TrainingPlanData, theme?: string) {
  const sessionType = getSessionType(session, trainingPlan);
  
  // First determine the color name
  let colorName: ColorName | undefined;
  
  // Check session style for colorName first (highest priority)
  if (session.sessionStyle?.colorName) {
    colorName = session.sessionStyle.colorName;
  } 
  // Then check session type defaultStyle for colorName
  else if (sessionType?.defaultStyle?.colorName) {
    colorName = sessionType.defaultStyle.colorName;
  }
  // Legacy fallback to determine colorName from session type
  else if (session.sessionType) {
    switch (session.sessionType) {
      case "Gym":
        colorName = "blue";
        break;
      case "Barmark":
        colorName = "green";
        break;
      case "Eget/Vila":
        colorName = "gray";
        break;
    }
  }
  
  // Get theme-aware colors based on the determined colorName
  const colorClasses = getThemeAwareColorClasses(colorName, theme);
  
  // For backward compatibility, also set the direct style properties
  let legacyStyle = {
    backgroundColor: "",
    borderColor: "",
    textColor: ""
  };
  
  // Set legacy style based on session type
  if (session.sessionType) {
    switch (session.sessionType) {
      case "Gym":
        legacyStyle = {
          backgroundColor: "blue-50",
          borderColor: "blue-200",
          textColor: "blue-800"
        };
        break;
      case "Barmark":
        legacyStyle = {
          backgroundColor: "green-50",
          borderColor: "green-200",
          textColor: "green-800"
        };
        break;
      case "Eget/Vila":
        legacyStyle = {
          backgroundColor: "gray-50",
          borderColor: "gray-200",
          textColor: "gray-800"
        };
        break;
    }
  }
  
  // Apply session type default style if available
  if (sessionType?.defaultStyle) {
    legacyStyle = {
      ...legacyStyle,
      ...sessionType.defaultStyle
    };
  }
  
  // Apply session-specific style overrides
  if (session.sessionStyle) {
    legacyStyle = {
      ...legacyStyle,
      ...session.sessionStyle
    };
  }
  
  return {
    ...legacyStyle,
    colorName,
    colorClasses,
    sessionTypeName: sessionType?.name || session.sessionType || "Unknown"
  };
}