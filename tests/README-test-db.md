# Test Database Setup for Playwright Tests

This document outlines how to set up and use the test database for Playwright end-to-end tests.

## Setup Process

1. **Create a Test Supabase Project**:
   - Go to [Supabase](https://supabase.com/) and create a new project for testing
   - Name it something like "[Your Project Name]-test"
   - Once created, go to Project Settings > API to get your API credentials

2. **Configure Test Environment Variables**:
   - Create a `.env.test` file in the project root if it doesn't exist 
   - Add your test Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_test_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_test_supabase_anon_key
   NODE_ENV=test
   ```

3. **Initialize the Test Database**:
   - Run the setup script to create the necessary tables:
   ```
   npm run test:db:setup
   ```

## Running Tests

- To run tests with the test database:
  ```
  npm run test:e2e
  ```

- To run tests with UI mode:
  ```
  npm run test:e2e:ui
  ```

- To set up the database and run tests in a single command:
  ```
  npm run test:e2e:with-setup
  ```

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

## How It Works

1. The test database configuration is loaded from `.env.test`
2. Tests use a separate database client that points to the test database
3. The database utility script (`tests/setup/setup-test-db.js`) handles schema creation
4. Test data helpers (`tests/helpers/test-data.ts`) manage test data creation and cleanup
5. Tests use the real database instead of localStorage mocking for more realistic testing

## Notes

- Test data is isolated in a separate Supabase project
- The `NODE_ENV=test` environment variable ensures the test database is used
- Database operations in the app use an abstraction layer that respects the environment
