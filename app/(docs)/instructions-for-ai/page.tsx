import React from "react"

const CodeBlock = ({ children }: { children: React.ReactNode }) => (
  <pre className="mt-2 mb-4 rounded-md border bg-muted p-4 font-mono text-sm overflow-x-auto relative group">
    <code>{children}</code>
  </pre>
)

const PythonCode = `import json
import zlib
import base64

# 1. Your training plan (T-JSON)
# PASTE THE GENERATED T-JSON OBJECT HERE
training_data = {}

# 2. Convert to JSON string
json_data = json.dumps(training_data)

# 3. Compress with zlib
compressed = zlib.compress(json_data.encode("utf-8"))

# 4. Encode to URL-safe Base64
encoded = base64.urlsafe_b64encode(compressed).decode("utf-8")

# 5. Build the URL
url = f"https://t-json.vercel.app/create/{encoded}"
print(url)
`

const JsonStructure = `{
  "metadata": {
    "planName": "string (Required)",
    "creationDate": "string (ISO 8601 Format)",
    "description": "string (Optional)",
    "author": "string (Optional)",
    "version": "string (Optional)"
  },
  "weekTypes": [
    {
      "id": "string (Unique ID, e.g., 'deload')",
      "name": "string (Display name, e.g., 'DELOAD')",
      "colorName": "string (Tailwind color name, e.g., 'yellow')",
      "description": "string (Optional)"
    }
  ],
  "sessionTypes": [
    {
      "id": "string (Unique ID, e.g., 'gym')",
      "name": "string (Display name, e.g., 'Gym')",
      "defaultStyle": {
        "colorName": "string (Optional, e.g., 'blue')"
      }
    }
  ],
  "blocks": [
    {
      "id": "string | number (Unique ID, e.g., 'block-1')",
      "name": "string (Display name, e.g., 'Foundation Phase')",
      "weeks": "number[] (Array of week numbers in this block)"
    }
  ],
  "exerciseDefinitions": [
    {
      "id": "string | number (Unique ID, e.g., 'sq')",
      "name": "string (Full name, e.g., 'Barbell Squat')",
      "isMainLift": "boolean (Optional)",
      "targetMuscles": ["string", "... (Optional)"]
    }
  ],
  "weeks": [
    {
      "weekNumber": "number (Required)",
      "blockId": "string | number (Links to blocks.id)",
      "weekTypeIds": ["string", "... (Links to weekTypes.id)"],
      "sessions": [
        {
          "sessionName": "string (e.g., 'Day 1: Upper Body')",
          "sessionTypeId": "string (Links to sessionTypes.id)",
          "exercises": [
            {
              "exerciseId": "string | number (Links to exerciseDefinitions.id)",
              "sets": "number | string",
              "reps": "string | number",
              "load": "string (e.g., '75% 1RM', 'RPE 8')"
            }
          ]
        }
      ]
    }
  ]
}`

const AiInstructions = () => {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <h3 className="text-lg font-semibold">Instructions for AI Assistant</h3>
      <p>
        <strong>Your Goal:</strong> Your primary goal is to act as an expert fitness coach. First,
        you will interview a user to understand their needs. Then, you will generate a personalized
        training plan in the <strong>T-JSON format</strong>. Finally, you will take that JSON data,
        compress it using a Python script, and provide the user with a single, shareable URL.
      </p>
      <hr className="my-6" />

      <h3 className="text-lg font-semibold">
        <strong>Step 1: The Interview (Understand the User)</strong>
      </h3>
      <p>
        Begin by asking the user the following questions to gather the necessary information for
        creating their plan. Do not generate any JSON until you have their answers.
      </p>
      <ol className="list-decimal pl-6 mt-2 space-y-2">
        <li>
          <strong>Primary Goal:</strong> What is your main fitness goal? (e.g., build muscle,
          increase strength, lose weight, run a 5k, general health)
        </li>
        <li>
          <strong>Experience Level:</strong> How would you describe your fitness level? (e.g.,
          complete beginner, intermediate, advanced, years of experience)
        </li>
        <li>
          <strong>Frequency & Duration:</strong> How many days per week can you train, and for how
          long each session?
        </li>
        <li>
          <strong>Equipment Access:</strong> What equipment do you have access to? (e.g., full gym,
          dumbbells and bands, bodyweight only)
        </li>
        <li>
          <strong>Preferences & Limitations:</strong> Are there any exercises you love, hate, or
          cannot do due to injury or other limitations?
        </li>
        <li>
          <strong>Program Length:</strong> How many weeks should this training plan last?
        </li>
      </ol>
      <hr className="my-6" />

      <h3 className="text-lg font-semibold">
        <strong>Step 2: Generate the T-JSON Plan</strong>
      </h3>
      <p>
        After the user has answered the interview questions, create a complete and valid JSON object
        that follows the T-JSON structure outlined below.
      </p>
      <p>
        <strong>T-JSON Structure Details:</strong>
      </p>
      <CodeBlock>{JsonStructure}</CodeBlock>
      <p>
        <strong>Key Requirements for the JSON:</strong>
      </p>
      <ul className="list-disc pl-6 mt-2 space-y-2">
        <li>
          Every <code>exerciseId</code> in a session must correspond to an <code>id</code> in{" "}
          <code>exerciseDefinitions</code>.
        </li>
        <li>
          Every <code>weekNumber</code> in <code>weeks</code> must be included in exactly one{" "}
          <code>block</code> in the <code>blocks</code> array.
        </li>
        <li>The final output must be a single, valid JSON object.</li>
      </ul>
      <hr className="my-6" />

      <h3 className="text-lg font-semibold">
        <strong>Step 3: Compress the JSON and Generate the Link</strong>
      </h3>
      <p>After you have generated the T-JSON object, you must perform the following actions:</p>
      <ol className="list-decimal pl-6 mt-2 space-y-2">
        <li>Take the complete JSON object you just created.</li>
        <li>
          Insert it into the <code>training_data</code> variable in the Python script below.
        </li>
        <li>
          <strong>Execute the Python script.</strong>
        </li>
        <li>
          Provide the user with <strong>only the final URL</strong> that the script prints.
        </li>
      </ol>
      <p>
        <strong>Python Script to Execute:</strong>
      </p>
      <CodeBlock>{PythonCode}</CodeBlock>
      <hr className="my-6" />

      <h3 className="text-lg font-semibold">
        <strong>Final Output</strong>
      </h3>
      <p>
        Your final response to the user should be a single line containing only the generated URL.
        For example: <code>https://t-json.vercel.app/create/COMPRESSED_DATA_HERE</code>
      </p>
    </div>
  )
}

export default AiInstructions
