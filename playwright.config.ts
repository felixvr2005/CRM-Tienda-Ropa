import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/e2e',
  testMatch: '**/*.pwtest.ts',
  timeout: 30_000,
  expect: { timeout: 5000 },

  // Web server: Playwright will start the local preview when running E2E locally/CI
  webServer: process.env.PW_SERVER_COMMAND
    ? undefined
    : {
        // Build first so the preview serves the latest compiled server (no stale dist)
        command: 'npm run build && npm run preview -- --port 5173 --host 127.0.0.1',
        url: 'http://127.0.0.1:5173',
        // ensure the preview process receives the test-mode env so server-side fallbacks run
        env: { PLAYWRIGHT_RUNNING: '1' },
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      },

  use: {
    headless: true,
    // Local preview uses port 5173 by default (Astro). CI overrides this with PLAYWRIGHT_BASE_URL.
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5173',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
  },
});