import { defineConfig, devices } from '@playwright/test';

// Matches all 22 test cases in the Qase Smoke Suite (plan id: 14)
const SMOKE_GREP =
  /TC-(01|02|03|06|09|10|13|14|16|19|20|21|426|427|428|432|438|441|442|443|446|447)\s*\|/;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 1,
  workers: 1,
  grep: SMOKE_GREP,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'allure-results' }],
  ],
  timeout: 90000,
  use: {
    baseURL: process.env.BASE_URL || 'https://app.synkvault.net',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    navigationTimeout: 15000,
    actionTimeout: 10000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
