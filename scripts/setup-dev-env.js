#!/usr/bin/env node
// setup-dev-env.js - Set up the development environment with Supabase

import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Setting up development environment with local Supabase...');

// Check if Supabase is already running
const statusCheck = spawnSync('bunx', ['supabase', 'status'], { 
  stdio: 'pipe',
  shell: true
});

if (statusCheck.status !== 0) {
  console.log('Starting Supabase...');
  // Start Supabase
  const startResult = spawnSync('bunx', ['supabase', 'start'], { 
    stdio: 'inherit',
    shell: true
  });

  if (startResult.status !== 0) {
    console.error('Error starting Supabase');
    process.exit(1);
  }
}

// Make sure we have the environment variables file
const envLocalPath = path.join(__dirname, '../../.env.local');
if (!fs.existsSync(envLocalPath)) {
  console.log('Creating .env.local file...');
  
  // Get the Supabase URL and key
  const keyResult = spawnSync('bunx', ['supabase', 'status'], {
    stdio: 'pipe',
    shell: true,
    encoding: 'utf8'
  });
  
  if (keyResult.status !== 0) {
    console.error('Error getting Supabase status');
    process.exit(1);
  }
  
  // Extract the URL and key from the output
  const output = keyResult.stdout || '';
  
  // Regex to extract values
  const urlMatch = output.match(/API URL:\s+(http:\/\/[\d\.]+:\d+)/);
  const keyMatch = output.match(/anon key:\s+([a-zA-Z0-9\.\_\-]+)/);
  
  if (!urlMatch || !keyMatch) {
    console.error('Could not extract Supabase URL or key from status output');
    process.exit(1);
  }
  
  const url = urlMatch[1];
  const key = keyMatch[1];
  
  // Create the .env.local file
  const envContent = `NEXT_PUBLIC_SUPABASE_URL=${url}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${key}`;
  
  fs.writeFileSync(envLocalPath, envContent);
  console.log('.env.local file created with Supabase credentials');
}

console.log('\n✅ Development environment is ready');
console.log('You can now run:');
console.log('  npm run dev');
console.log('Your app will use the local Supabase instance');
