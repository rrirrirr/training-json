// File: lib/db-client.ts
// This is a wrapper that selects the appropriate database client based on environment

import { supabase as prodClient } from "./supa-client"
import { supabase as testClient } from "./supa-client-test"

// Determine which client to use based on environment
const isTestEnv = process.env.NODE_ENV === 'test'
export const db = isTestEnv ? testClient : prodClient

// Export the type from the original client
export type { Database } from "./supa-client"
