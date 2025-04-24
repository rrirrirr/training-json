#!/usr/bin/env node
// reset-local-db.js - Reset the local test database

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local test environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.test.local') });

console.log('Resetting local test database...');

// Use the Supabase CLI to reset the database
console.log('Running migrations...');
const migrateResult = spawnSync('bunx', ['supabase', 'db', 'reset'], { 
  stdio: 'inherit',
  shell: true
});

if (migrateResult.status !== 0) {
  console.error('Error resetting database with migrations');
  
  // Try to apply migrations manually if reset failed
  console.log('Trying to apply migrations manually...');
  
  // Read the migration file
  const migrationFilePath = path.join(__dirname, '../../supabase/migrations/20250424000000_training_plan_schema.sql');
  if (fs.existsSync(migrationFilePath)) {
    const migrationSql = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Create a Supabase client with local credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
    
    console.log('Using URL:', supabaseUrl);
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Try to execute the SQL directly
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: migrationSql });
      if (error) {
        console.error('Error applying migrations manually:', error);
      } else {
        console.log('Migrations applied manually');
      }
    } catch (error) {
      console.error('Error executing SQL:', error);
    }
  }
}

// Try to seed the database with test data
try {
  console.log('Seeding database with test data...');
  
  // Create a Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  
  console.log('Using URL:', supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Define the test data
  const TEST_PLAN_ID = '123e4567-e89b-12d3-a456-426614174000';
  const OTHER_PLAN_ID = '123e4567-e89b-12d3-a456-426614174001';
  
  // Create the test plan
  const testPlan = {
    id: TEST_PLAN_ID,
    metadata: {
      planName: 'Test Training Plan',
      creationDate: '2023-01-01T00:00:00.000Z',
    },
    weekTypes: [{ id: 1, name: 'Regular', colorName: 'blue' }],
    exerciseDefinitions: [{ id: 'ex1', name: 'Squat', category: 'Legs' }],
    weeks: [{ weekNumber: 1, weekType: 'Regular', weekTypeIds: [1], sessions: [] }],
    monthBlocks: [{ id: 1, name: 'First Block', weekNumbers: [1] }],
  };

  // Create the other test plan
  const otherPlan = {
    id: OTHER_PLAN_ID,
    metadata: {
      planName: 'Other Training Plan',
      creationDate: '2023-01-02T00:00:00.000Z',
    },
    weekTypes: [],
    exerciseDefinitions: [],
    weeks: [],
    monthBlocks: [],
  };

  // Insert the plans
  // First clear any existing data
  await supabase
    .from('training_plans')
    .delete()
    .in('id', [TEST_PLAN_ID, OTHER_PLAN_ID]);
  
  // Insert the test plans
  const { error: error1 } = await supabase
    .from('training_plans')
    .insert({
      id: TEST_PLAN_ID,
      plan_data: testPlan
    });
  
  if (error1) {
    console.error('Error inserting test plan:', error1);
  }
  
  const { error: error2 } = await supabase
    .from('training_plans')
    .insert({
      id: OTHER_PLAN_ID,
      plan_data: otherPlan
    });
  
  if (error2) {
    console.error('Error inserting other plan:', error2);
  }
  
  console.log('Database seeded with test data');
} catch (error) {
  console.error('Error seeding database:', error);
}

// Verify connection to the database
try {
  console.log('Verifying database connection...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.from('training_plans').select('id');
  
  if (error) {
    throw error;
  }
  
  console.log('Database connection successful!');
  console.log('Plans found:', data.length);
  console.log('Local test database has been reset and is ready for testing.');
} catch (error) {
  console.error('Error verifying database connection:', error);
  process.exit(1);
}
