// File: tests/setup/setup-test-db.js
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load the test environment variables
dotenv.config({ path: '.env.test' });

// Create a Supabase client with the test credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.test file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Initializes the test database with the schema
 */
async function setupTestDatabase() {
  try {
    console.log('Setting up test database...');
    
    // Read the SQL setup file
    const sqlSetupPath = path.join(process.cwd(), 'tests', 'setup', 'test-db-setup.sql');
    const sqlSetup = fs.readFileSync(sqlSetupPath, 'utf8');
    
    // Execute the SQL statements
    const { error } = await supabase.rpc('exec_sql', { sql: sqlSetup });
    
    if (error) {
      throw error;
    }
    
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

/**
 * Clears all data from the test database
 */
async function clearTestDatabase() {
  try {
    console.log('Clearing test database...');
    
    // Delete data from tables in the correct order (respecting foreign keys)
    const { error: error1 } = await supabase.from('plan_access_log').delete().neq('id', 'dummy-id');
    const { error: error2 } = await supabase.from('training_plans').delete().neq('id', 'dummy-id');
    
    if (error1 || error2) {
      throw error1 || error2;
    }
    
    console.log('Test database cleared');
  } catch (error) {
    console.error('Error clearing test database:', error);
    process.exit(1);
  }
}

// Determine the action based on command line arguments
const action = process.argv[2];

if (action === 'setup') {
  setupTestDatabase();
} else if (action === 'clear') {
  clearTestDatabase();
} else if (action === 'reset') {
  // Both clear and setup
  clearTestDatabase().then(setupTestDatabase);
} else {
  console.log('Usage: node setup-test-db.js [setup|clear|reset]');
  process.exit(1);
}
