// File: tests/helpers/local-test-data.ts
import { createClient } from "@supabase/supabase-js"
import type { TrainingPlanData } from "@/types/training-plan"
import type { Database } from "@/lib/supa-client"
import * as dotenv from "dotenv"
import * as path from "path"
import * as fs from "fs"

// Load environment variables from .env.test.local or .env.test if exists
const testLocalPath = path.resolve(".env.test.local")
const testPath = path.resolve(".env.test")

if (fs.existsSync(testLocalPath)) {
  console.log("Loading environment from .env.test.local")
  dotenv.config({ path: testLocalPath })
} else if (fs.existsSync(testPath)) {
  console.log("Loading environment from .env.test")
  dotenv.config({ path: testPath })
} else {
  console.log("No test environment file found, using default values")
}

// Create a dedicated local test client
// Apply defaults for local dev/test if not defined in env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"

console.log("Using Supabase URL:", supabaseUrl)

let testClient: any = null

try {
  // Create the Supabase client - we have fallbacks for URL and key so this should work
  testClient = createClient<Database>(supabaseUrl, supabaseKey)
} catch (error) {
  console.error("Failed to create Supabase client:", error)
  // Create a dummy client for tests to proceed
  testClient = {
    from: () => ({
      select: () => ({ in: () => ({ data: [] }) }),
      delete: () => ({ in: () => ({}) }),
    }),
  }
}

// Test plan IDs - use proper UUIDs for Postgres compatibility
export const TEST_PLAN_ID = "123e4567-e89b-12d3-a456-426614174000"
export const OTHER_PLAN_ID = "123e4567-e89b-12d3-a456-426614174001"

/**
 * Verifies the test data exists and is accessible
 */
export async function verifyTestData(): Promise<boolean> {
  try {
    // Check that test plans exist
    const { data, error } = await testClient
      .from("training_plans")
      .select("id")
      .in("id", [TEST_PLAN_ID, OTHER_PLAN_ID])

    if (error) {
      console.error("Database error:", error)
      throw error
    }

    // Verify both test plans exist
    if (!data || data.length !== 2) {
      console.error("Test data verification failed: Missing test plans")
      // Instead of returning false, let's try to create the test data
      await createTestData()
      return true
    }

    return true
  } catch (error) {
    console.error("Error verifying test data:", error)
    // Try to create the test data
    try {
      await createTestData()
      return true
    } catch (createError) {
      console.error("Failed to create test data:", createError)
      return false
    }
  }
}

/**
 * Creates test data for testing
 */
async function createTestData(): Promise<void> {
  console.log("Creating test data...")

  // Create the test plan
  const testPlan: TrainingPlanData = {
    id: TEST_PLAN_ID,
    metadata: {
      planName: "Test Training Plan",
      creationDate: "2023-01-01T00:00:00.000Z",
    },
    weekTypes: [{ id: 1, name: "Regular", colorName: "blue" }],
    exerciseDefinitions: [{ id: "ex1", name: "Squat", category: "Legs" }],
    weeks: [{ weekNumber: 1, weekType: "Regular", weekTypeIds: [1], sessions: [] }],
    blocks: [
      {
        id: 1,
        name: "First Block",
        // Add the weeks array that's required by the BlockView component
        weeks: [1],
      },
    ],
  }

  // Create the other test plan
  const otherPlan: TrainingPlanData = {
    id: OTHER_PLAN_ID,
    metadata: {
      planName: "Other Training Plan",
      creationDate: "2023-01-02T00:00:00.000Z",
    },
    weekTypes: [],
    exerciseDefinitions: [],
    weeks: [],
    blocks: [],
  }

  // First try to delete any existing test data to avoid conflicts
  try {
    await testClient.from("training_plans").delete().in("id", [TEST_PLAN_ID, OTHER_PLAN_ID])
  } catch (error) {
    console.error("Error deleting existing test data:", error)
  }

  // Insert the test plans
  try {
    const { error: error1 } = await testClient.from("training_plans").insert({
      id: TEST_PLAN_ID,
      plan_data: testPlan,
    })

    if (error1) throw error1

    const { error: error2 } = await testClient.from("training_plans").insert({
      id: OTHER_PLAN_ID,
      plan_data: otherPlan,
    })

    if (error2) throw error2

    console.log("Test data created successfully")
  } catch (error) {
    console.error("Error inserting test data:", error)
    throw error
  }
}

/**
 * Updates a test plan with new data
 */
export async function updateTestPlan(
  id: string,
  planData: Partial<TrainingPlanData>
): Promise<boolean> {
  try {
    // Get the current plan
    const { data: currentPlan, error: fetchError } = await testClient
      .from("training_plans")
      .select("plan_data")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError
    if (!currentPlan) throw new Error(`Plan with ID ${id} not found`)

    // Merge the current data with the new data
    const updatedPlanData = {
      ...currentPlan.plan_data,
      ...planData,
    }

    // Update the plan
    const { error: updateError } = await testClient
      .from("training_plans")
      .update({ plan_data: updatedPlanData })
      .eq("id", id)

    if (updateError) throw updateError

    return true
  } catch (error) {
    console.error(`Error updating test plan ${id}:`, error)
    return false
  }
}

/**
 * Resets specific test plans to their original state
 */
export async function resetSpecificTestPlans(ids: string[]): Promise<boolean> {
  try {
    await createTestData()
    return true
  } catch (error) {
    console.error("Error resetting specific test plans:", error)
    return false
  }
}
