import type { Session, SessionTypeDefinition, TrainingPlanData } from "@/types/training-plan"

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
export function getSessionStyling(session: Session, trainingPlan: TrainingPlanData) {
  const sessionType = getSessionType(session, trainingPlan);
  
  // Start with default styling based on legacy sessionType if no session type found
  let defaultStyle = {
    backgroundColor: "",
    borderColor: "",
    textColor: ""
  };
  
  if (session.sessionType) {
    switch (session.sessionType) {
      case "Gym":
        defaultStyle = {
          backgroundColor: "blue-50",
          borderColor: "blue-200",
          textColor: "blue-800"
        };
        break;
      case "Barmark":
        defaultStyle = {
          backgroundColor: "green-50",
          borderColor: "green-200",
          textColor: "green-800"
        };
        break;
      case "Eget/Vila":
        defaultStyle = {
          backgroundColor: "gray-50",
          borderColor: "gray-200",
          textColor: "gray-800"
        };
        break;
    }
  }
  
  // Apply session type default style if available
  if (sessionType?.defaultStyle) {
    defaultStyle = {
      ...defaultStyle,
      ...sessionType.defaultStyle
    };
  }
  
  // Apply session-specific style overrides
  const combinedStyle = {
    ...defaultStyle,
    ...session.sessionStyle
  };
  
  return {
    ...combinedStyle,
    sessionTypeName: sessionType?.name || session.sessionType || "Unknown"
  };
}
