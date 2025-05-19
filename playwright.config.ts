import { defineConfig, devices } from "@playwright/test"
import dotenv from "dotenv"
import path from "path"
import fs from "fs"

// First look for .env.test.local, then fall back to .env.test
const testLocalPath = path.resolve(".env.test.local")
const testPath = path.resolve(".env.test")

if (fs.existsSync(testLocalPath)) {
  console.log("Loading environment from .env.test.local")
  dotenv.config({ path: testLocalPath })
} else if (fs.existsSync(testPath)) {
  console.log("Loading environment from .env.test")
  dotenv.config({ path: testPath })
} else {
  console.log("No test environment file found, using default values")
}

// Set NODE_ENV to 'test' for testing
process.env.NODE_ENV = "test"

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 120 * 1000,
  expect: {
    timeout: 20000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // {
    // name: "firefox",
    // use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  webServer: {
    // Use the same command but with test environment
    command: "NODE_ENV=test npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
    env: {
      NODE_ENV: "test",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
})
