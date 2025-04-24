# Using Local Supabase for Development

This guide explains how to use your local Supabase instance for day-to-day development.

## Setup Process

### 1. Initial Setup

First time only:

```bash
# Start Supabase and set up the development environment
npm run setup:dev
```

This will:
- Start Supabase if it's not already running
- Create `.env.local` with the correct Supabase credentials
- Make sure your database is properly initialized

### 2. Daily Development

Regular development workflow:

```bash
# If Supabase is not running yet
npm run supabase:start

# Then start your Next.js app
npm run dev
```

Or use the combined command:

```bash
# This will start both Supabase and Next.js
npm run dev:with-supabase
```

## Database Management

### Resetting the Database

If you need to reset your database to a clean state:

```bash
npm run supabase:reset
```

### Stopping Supabase

When you're done working:

```bash
npm run supabase:stop
```

## Accessing Supabase Studio

You can manage your database, auth settings, etc. through the Supabase Studio UI:

http://127.0.0.1:54323

## Environment Variables

Your app automatically uses these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Switching Between Local and Production

- For local development: Use the `.env.local` file (created by setup:dev)
- For production: Use your production environment variables
