import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Location of test files
  testDir: './tests',

  // Timeout per test (30 seconds)
  timeout: 30_000,

  // Overall test suite timeout (longer in CI)
  globalTimeout: process.env.CI ? 600_000 : 300_000,

  // Auto-retry on failure (2 retries in CI, 0 locally)
  retries: process.env.CI ? 2 : 0,

  // Parallel execution (single-threaded in CI)
  fullyParallel: true,
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['list']]  // CI: HTML + list output
    : [['html', { open: 'on-failure' }]],       // Local: open browser only on failure

  use: {
    // Base URL for tests
    baseURL: 'https://practicesoftwaretesting.com',

    // This app uses the data-test attribute, so override testIdAttribute
    // (Playwright's default is data-testid)
    testIdAttribute: 'data-test',

    // Save screenshot on failure
    screenshot: 'only-on-failure',

    // Save trace on failure (for debugging)
    trace: 'on-first-retry',

    // Browser display (headless in CI)
    headless: process.env.CI ? true : false,

    // Timeout per action
    actionTimeout: 10_000,

    // Navigation timeout
    navigationTimeout: 15_000,
  },

  // Target browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to add more browsers as needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // Output directory (screenshots and traces)
  outputDir: './test-results',
});
