import { supabase } from "@/lib/supa-client"
import type { TrainingPlanData } from "@/types/training-plan"

/**
 * Fetches a single training plan by its ID from Supabase.
 *
 * @param planId - The UUID of the plan to fetch.
 * @returns An object containing the plan data if found, null if not found,
 * or throws an error if a database error occurs.
 */
export async function fetchPlanById(planId: string): Promise<TrainingPlanData | null> {
  // Basic validation upfront
  if (!planId || typeof planId !== "string" || planId.toLowerCase() === "undefined") {
    console.error("fetchPlanById called with invalid ID:", planId)
    // Decide how to handle invalid ID - throw error or return null?
    // Throwing might be better to indicate a programming error upstream.
    throw new Error("Invalid Plan ID provided for fetching.")
  }

  console.log(`Workspaceing plan data for ID: ${planId}`)
  const { data, error, status } = await supabase
    .from("training_plans")
    .select("plan_data")
    .eq("id", planId)
    .single()

  // Handle potential errors
  if (error) {
    if (status === 406) {
      // PostgREST 406: No rows found. This is expected if the ID doesn't exist.
      console.log(`Plan with ID ${planId} not found.`)
      return null
    } else {
      // Other unexpected database error
      console.error("Supabase fetch error:", error)
      // Re-throw the error to be handled by the caller (e.g., the page)
      throw new Error(`Failed to fetch plan: ${error.message}`)
    }
  }

  // Return the plan data if found
  if (data && data.plan_data) {
    supabase
      .from("plan_access_log")
      .insert({ plan_id: planId }) // accessed_at defaults to now()
      .then(({ error: logError }) => {
        if (logError) {
          console.error(`Failed to log access for plan ${planId}:`, logError)
        }
      })

    return data.plan_data as TrainingPlanData // Assuming the data structure matches
  }

  // Should ideally be caught by status 406, but as a fallback:
  return null
}
