import { defineConfig, devices } from '@playwright/test';

export const testOTP = '123456';
export const adminEmail = 'admin@e2e-test.com';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `TEST_OTP=${testOTP} ADMIN_EMAIL=${adminEmail} NODE_ENV=test PORT=3002 USER_WEBHOOK_SECRET=test-webhook-secret npm run start:test`,
      url: 'http://localhost:3002/health',
      cwd: '../backend',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'TEST_BACKEND_URL=http://localhost:3002 npm run start -- --port 5174',
      url: 'http://localhost:5174',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
