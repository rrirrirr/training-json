// File: tests/setup/setup-test-db.js
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load the test environment variables
dotenv.config({ path: '.env.test.local' });

// Create a Supabase client with the test credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.test.local file');
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
 * Clears all data from the test database by using a .neq filter 
 * to satisfy the 'DELETE requires WHERE' setting.
 */
async function clearTestDatabase() {
  try {
    console.log('Clearing test database...');

    // Use a valid nil UUID for the comparison. 
    // This satisfies the 'requires WHERE' rule while targeting almost all rows.
    const nilUuid = '00000000-0000-0000-0000-000000000000';

    // Delete data from tables where ID is not the nil UUID
    console.log(`Deleting rows from plan_access_log where id != ${nilUuid}...`);
    const { error: error1 } = await supabase
      .from('plan_access_log')
      .delete()
      .neq('id', nilUuid); // Use a filter likely to match all relevant rows

    if (error1) {
      console.error('Error deleting from plan_access_log:', error1);
      throw error1;
    }
    console.log('Successfully deleted rows from plan_access_log.');


    console.log(`Deleting rows from training_plans where id != ${nilUuid}...`);
    const { error: error2 } = await supabase
      .from('training_plans')
      .delete()
      .neq('id', nilUuid); // Use a filter likely to match all relevant rows

    if (error2) {
      console.error('Error deleting from training_plans:', error2);
      throw error2;
    }
    console.log('Successfully deleted rows from training_plans.');

    console.log('Test database cleared successfully.');

  } catch (error) {
    console.error('Failed during database clearing process.');
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
