# Test Setup Guide

This document explains how to set up and use testing tools for the T-JSON application.

## Local Supabase for Development and Testing

### Prerequisites

1. Install Docker Desktop (required by Supabase CLI)
2. Install Supabase CLI globally:
   ```bash
   npm install -g supabase
   ```

### Getting Started with Local Supabase

#### 1. Start the Local Supabase Instance

```bash
npm run supabase:start
```

This will start the Supabase Docker containers, including PostgreSQL and all Supabase services.

The first time you run this, it will:
- Download the Docker images
- Create the database
- Apply migrations from `supabase/migrations/`
- Seed the database with test data from `supabase/seed.sql`

#### 2. Start Development with Supabase

Combined command to start both Supabase and Next.js:

```bash
npm run dev:with-supabase
```

Or run them separately:

```bash
# If Supabase is not running yet
npm run supabase:start

# Then start your Next.js app
npm run dev
```

#### 3. Reset the Database (if needed)

```bash
npm run supabase:reset
```

#### 4. Stop the Local Supabase Instance

```bash
npm run supabase:stop
```

### Accessing Supabase Studio

You can access the Supabase Studio UI at: http://localhost:54323

## Playwright End-to-End Tests

### Setting Up a Test Database

#### Option 1: Using Local Supabase for Tests

This is simplest and recommended for most developers:

```bash
# Reset and start the local Supabase instance
npm run supabase:reset

# Run tests against the local instance
npm run test:e2e
```

#### Option 2: Using a Dedicated Test Supabase Project

For CI/CD or a dedicated test environment:

1. Create a test Supabase project on Supabase.com
2. Configure test environment variables in `.env.test`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_supabase_anon_key
   NODE_ENV=test
   ```
3. Initialize the test database:
   ```
   npm run test:db:setup
   ```

### Running Tests

- Run tests (standard):
  ```
  npm run test:e2e
  ```

- Run tests with UI mode:
  ```
  npm run test:e2e:ui
  ```

### Data Attributes for Testing

For reliable test selection, we use data attributes throughout the application:

- `data-testid="plan-item"` - For plan items in the sidebar
- `data-testid="edit-mode-indicator"` - For the plan mode indicator
- `data-testid="plan-name-input"` - For the plan name input field
- `data-testid="save-button"` - For the save button
- `data-testid="discard-button"` - For the discard changes button
- `data-testid="app-loaded"` - Indicator that the app is fully loaded

When writing tests, use these attributes for reliable element selection.

## Database Management Scripts

- **Setup the database** (create tables):
  ```
  npm run test:db:setup
  ```

- **Clear all data** from the database:
  ```
  npm run test:db:clear
  ```

- **Reset the database** (clear data and recreate tables):
  ```
  npm run test:db:reset
  ```

## Environment Variables

- **Local development**: `.env.local` (created by setup:dev)
- **Local testing**: use with local Supabase instance
- **CI/CD testing**: `.env.test` with dedicated test database
- **Production**: Production environment variables