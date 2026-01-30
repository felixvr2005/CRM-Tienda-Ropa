import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright/e2e',
  testMatch: '**/*.pwtest.ts',
  timeout: 30_000,
  expect: { timeout: 5000 },
  use: {
    headless: true,
    // Local preview uses port 5173 by default (Astro). CI overrides this with PLAYWRIGHT_BASE_URL.
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
  },
});