// File: lib/supa-client-test.ts
import { createClient } from "@supabase/supabase-js"
import type { TrainingPlanData } from "@/types/training-plan"
import type { Database } from "./supa-client"

// For test environments only
console.log("🧪 Using TEST Supabase configuration")

// Fetch Supabase URL and Anon Key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Basic validation
if (!supabaseUrl) {
  throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_URL for test environment")
}
if (!supabaseAnonKey) {
  throw new Error("Missing environment variable NEXT_PUBLIC_SUPABASE_ANON_KEY for test environment")
}

// Create and export the Supabase client instance for tests
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
