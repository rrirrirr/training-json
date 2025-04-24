# Local Supabase Testing Setup

This document explains how to use Supabase locally for testing with Playwright.

## Prerequisites

1. Install Docker Desktop (required by Supabase CLI)
2. Install Supabase CLI globally:
   ```bash
   npm install -g supabase
   ```

## Getting Started

### 1. Start the Local Supabase Instance

```bash
npm run supabase:start
```

This will start the Supabase Docker containers, including PostgreSQL and all Supabase services.

The first time you run this, it will:
- Download the Docker images
- Create the database
- Apply migrations from `supabase/migrations/`
- Seed the database with test data from `supabase/seed.sql`

### 2. Reset the Database (if needed)

To reset the database to a clean state:

```bash
npm run supabase:reset
```

This will:
- Reset the database
- Apply all migrations again
- Re-seed the database with test data

### 3. Run Tests with Local Supabase

```bash
npm run test:local
```

This command:
1. Resets the local database (migrations + seed data)
2. Runs the Playwright tests against the local Supabase instance

### 4. Stop the Local Supabase Instance

When you're done testing:

```bash
npm run supabase:stop
```

## Configuration Files

- `supabase/migrations/` - Contains database schema migrations
- `supabase/seed.sql` - Contains test data for local development
- `supabase/config.toml` - Local Supabase configuration
- `.env.test.local` - Environment variables for local testing

## Important Connection Details

The local Supabase instance runs with these default connection details:

- **URL**: http://localhost:54321
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
- **Database URL**: postgresql://postgres:postgres@localhost:54322/postgres

### Supabase Studio

You can access the Supabase Studio UI at:
http://localhost:54323

This gives you a web interface to:
- Browse database tables
- Run SQL queries
- Check authentication settings
- Monitor API usage
