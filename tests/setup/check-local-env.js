#!/usr/bin/env node
// check-local-env.js - Check if the local environment is set up correctly

import { spawnSync } from 'child_process';

// Check if Supabase CLI is installed
console.log('Checking Supabase CLI installation...');
const supabaseCLI = spawnSync('bunx', ['supabase', '--version'], { 
  stdio: 'pipe',
  shell: true
});

if (supabaseCLI.status !== 0) {
  console.error('\n❌ Supabase CLI is not available via bunx');
  console.log('Please make sure you have bun installed and can run: bunx supabase');
  process.exit(1);
}

// Check if Docker is running
console.log('Checking Docker status...');
const docker = spawnSync('docker', ['info'], { 
  stdio: 'pipe',
  shell: true
});

if (docker.status !== 0) {
  console.error('\n❌ Docker is not running or not installed');
  console.log('Please start Docker Desktop or install Docker');
  process.exit(1);
}

// Check if Supabase project is initialized
console.log('Checking Supabase project initialization...');
const supabaseCheck = spawnSync('ls', ['supabase/config.toml'], { 
  stdio: 'pipe',
  shell: true
});

if (supabaseCheck.status !== 0) {
  console.error('\n❌ Supabase project is not initialized');
  console.log('Please run: bunx supabase init');
  process.exit(1);
}

console.log('\n✅ Local environment is ready for testing');
console.log('You can start the local Supabase instance with: npm run supabase:start');
console.log('Then run tests with: npm run test:local');
