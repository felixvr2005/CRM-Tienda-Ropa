import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/e2e',
  testMatch: '**/*.pwtest.ts',
  timeout: 30_000,
  expect: { timeout: 5000 },
  use: {
    headless: true,
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
  },
});