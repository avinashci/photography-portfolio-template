const { defineConfig, devices } = require('@playwright/test')

/**
 * Optimized Playwright Configuration for Accessibility Testing
 *
 * This configuration is specifically optimized for fast, reliable
 * accessibility testing with minimal timeouts and resource usage.
 */

module.exports = defineConfig({
  testDir: './tests',

  // Optimized timeout settings for accessibility testing
  timeout: 45 * 1000, // 45 seconds per test (increased for heavy pages)
  expect: {
    timeout: 15 * 1000, // 15 seconds for assertions
  },

  // Run tests in sequence for more reliable results
  fullyParallel: false,
  workers: 1,

  // Retry failed tests
  retries: process.env.CI ? 2 : 1,

  // Reporter configuration with organized output
  reporter: [
    ['html', { outputFolder: 'reports/accessibility/playwright-html' }],
    ['json', { outputFile: 'reports/accessibility/playwright-results.json' }],
    ['list'],
    // Custom reporter for accessibility summary
    ['junit', { outputFile: 'reports/accessibility/junit-results.xml' }]
  ],

  // Optimized settings for accessibility testing
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    // Browser context options optimized for testing
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Viewport size
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors for local development
    ignoreHTTPSErrors: true,

    // Reduce animations for faster testing
    reducedMotion: 'reduce',

    // Disable images and fonts for faster loading (accessibility testing doesn't need them)
    javaScriptEnabled: true,

    // Navigation timeout
    navigationTimeout: 30 * 1000,
    actionTimeout: 10 * 1000,
  },

  // Configure projects for essential browsers only (faster testing)
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Disable images for faster loading
        permissions: [],
      },
    },

    // Add Firefox for cross-browser accessibility validation
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        permissions: [],
      },
    },

    // Mobile testing (essential for responsive accessibility)
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        permissions: [],
      },
    },
  ],

  // Optimized web server configuration
  webServer: {
    command: process.env.NODE_ENV === 'production'
      ? 'pnpm start'
      : 'cross-env DISABLE_IMAGE_OPTIMIZATION=true pnpm dev',
    url: process.env.BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 minutes to start the server
    env: {
      // Optimize for testing
      'NODE_ENV': 'test',
      'DISABLE_ANALYTICS': 'true',
      'DISABLE_EXTERNAL_IMAGES': 'true',
      'FAST_REFRESH': 'false'
    }
  },

  // Global test setup
  globalSetup: './tests/global-setup.cjs',
  globalTeardown: './tests/global-teardown.cjs',
})