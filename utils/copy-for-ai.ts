"use client"

/**
 * Utility to prepare JSON data with error information for AI assistance
 * Creates a properly formatted message with the JSON data and error information
 * that users can directly paste to an AI assistant
 */
export const copyJsonErrorForAI = async (
  jsonText: string,
  errorMessage: string | null,
  showCopyNotification: (success: boolean) => void
) => {
  try {
    // Basic JSON structure documentation
    const jsonStructureDoc = `
# Training Plan JSON Structure

The T-JSON app requires a specific JSON structure with these key sections:

1. Required top-level properties:
   - \`metadata\`: Contains plan-wide information (must include planName)
   - \`exerciseDefinitions\`: Array defining all exercises
   - \`weeks\`: Array of all training weeks
   - \`monthBlocks\`: Information about how weeks are grouped

2. Required references between sections:
   - weeks reference blocks via \`blockId\`
   - sessions reference sessionTypes via \`sessionTypeId\`
   - exercises reference exerciseDefinitions via \`exerciseId\`

Example minimal structure:

\`\`\`json
{
  "metadata": {
    "planName": "My Training Plan"
  },
  "exerciseDefinitions": [
    {
      "id": "ex1",
      "name": "Example Exercise"
    }
  ],
  "weeks": [
    {
      "weekNumber": 1,
      "blockId": "block-1",
      "sessions": [
        {
          "sessionName": "Session 1",
          "sessionTypeId": "gym",
          "exercises": [
            {
              "exerciseId": "ex1",
              "sets": 3,
              "reps": "8",
              "load": "Light"
            }
          ]
        }
      ]
    }
  ],
  "monthBlocks": [
    {
      "id": 1,
      "name": "Month 1",
      "weeks": [1]
    }
  ]
}
\`\`\`
    `;

    // Assemble the content for the AI
    const content = `
I need help with fixing JSON for my training plan in the T-JSON app. The validation is failing with the following error:

ERROR: ${errorMessage || "JSON validation failed"}

Here's my current JSON:

\`\`\`json
${jsonText}
\`\`\`

${jsonStructureDoc}

Can you please help me fix my JSON to match the required structure?
`;

    // Copy to clipboard
    await navigator.clipboard.writeText(content);
    showCopyNotification(true);
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    showCopyNotification(false);
  }
};
