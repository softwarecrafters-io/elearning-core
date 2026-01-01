import { test, expect } from '@playwright/test';
import { Routes } from '../../../shared/infrastructure/ui/routes';
import { testOTP } from '../../../../playwright.config';

const backendUrl = 'http://localhost:3002';

async function registerUser(
  request: typeof test extends (args: infer T) => void ? T : never,
  email: string,
  name: string
) {
  await request.post(`${backendUrl}/auth/register`, {
    data: { email, name },
  });
}

async function loginAndVerify(page: typeof test extends (args: { page: infer P }) => void ? P : never, email: string) {
  await page.goto(Routes.Login);
  await page.getByPlaceholder('Email').fill(email);
  await page.getByRole('button', { name: 'Send OTP' }).click();
  await expect(page).toHaveURL(new RegExp(`${Routes.Verify}\\?email=`), { timeout: 5000 });
  await page.getByPlaceholder('000000').fill(testOTP);
  await page.getByRole('button', { name: 'Verify' }).click();
  await expect(page).toHaveURL(Routes.Profile, { timeout: 5000 });
}

test.describe('Login Page', () => {
  test('shows login form with email input and submit button', async ({ page }) => {
    await page.goto(Routes.Login);

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByPlaceholder('Email')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send OTP' })).toBeVisible();
  });

  test('shows back to home link', async ({ page }) => {
    await page.goto(Routes.Login);

    await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible();
  });

  test('navigates to home when clicking back link', async ({ page }) => {
    await page.goto(Routes.Login);

    await page.getByRole('link', { name: 'Back to Home' }).click();

    await expect(page).toHaveURL(Routes.Home);
  });

  test('shows error when user not found', async ({ page }) => {
    await page.goto(Routes.Login);

    await page.getByPlaceholder('Email').fill('nonexistent@example.com');
    await page.getByRole('button', { name: 'Send OTP' }).click();

    await expect(page.getByText('User not found')).toBeVisible({ timeout: 5000 });
  });

  test('navigates to verify page after successful OTP request', async ({ page, request }) => {
    const email = `e2e-${Date.now()}@example.com`;
    await registerUser(request, email, 'E2E Test User');
    await page.goto(Routes.Login);

    await page.getByPlaceholder('Email').fill(email);
    await page.getByRole('button', { name: 'Send OTP' }).click();

    await expect(page).toHaveURL(new RegExp(`${Routes.Verify}\\?email=`), { timeout: 5000 });
  });
});

test.describe('Verify OTP Page', () => {
  test('redirects to login when no email in query params', async ({ page }) => {
    await page.goto(Routes.Verify);

    await expect(page).toHaveURL(Routes.Login);
  });

  test('shows verify form when email is provided', async ({ page }) => {
    await page.goto(`${Routes.Verify}?email=test@example.com`);

    await expect(page.getByRole('heading', { name: 'Verify OTP' })).toBeVisible();
    await expect(page.getByText('Enter the code sent to test@example.com')).toBeVisible();
    await expect(page.getByPlaceholder('000000')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verify' })).toBeVisible();
  });

  test('shows back to login link', async ({ page }) => {
    await page.goto(`${Routes.Verify}?email=test@example.com`);

    await expect(page.getByRole('link', { name: 'Back to Login' })).toBeVisible();
  });

  test('shows error for invalid OTP', async ({ page, request }) => {
    const email = `e2e-otp-${Date.now()}@example.com`;
    await registerUser(request, email, 'E2E OTP Test');
    await request.post(`${backendUrl}/auth/login`, {
      data: { email },
    });
    await page.goto(`${Routes.Verify}?email=${encodeURIComponent(email)}`);

    await page.getByPlaceholder('000000').fill('000000');
    await page.getByRole('button', { name: 'Verify' }).click();

    await expect(page.getByText('Invalid or expired OTP code')).toBeVisible({ timeout: 5000 });
  });

  test('navigates to profile after successful OTP verification', async ({ page, request }) => {
    const email = `e2e-verify-${Date.now()}@example.com`;
    await registerUser(request, email, 'E2E Verify Test');

    await loginAndVerify(page, email);

    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
  });
});

test.describe('Profile Page', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto(Routes.Profile);

    await expect(page).toHaveURL(Routes.Login);
  });

  test('shows profile information after authentication', async ({ page, request }) => {
    const email = `e2e-profile-${Date.now()}@example.com`;
    const name = 'E2E Profile User';
    await registerUser(request, email, name);

    await loginAndVerify(page, email);

    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText(name)).toBeVisible();
  });

  test('allows editing profile name', async ({ page, request }) => {
    const email = `e2e-edit-${Date.now()}@example.com`;
    await registerUser(request, email, 'Original Name');

    await loginAndVerify(page, email);
    await page.getByRole('button', { name: 'Edit Name' }).click();
    await page.getByRole('textbox').fill('Updated Name');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Updated Name')).toBeVisible({ timeout: 5000 });
  });

  test('allows canceling profile edit', async ({ page, request }) => {
    const email = `e2e-cancel-${Date.now()}@example.com`;
    const originalName = 'Original Name';
    await registerUser(request, email, originalName);

    await loginAndVerify(page, email);
    await page.getByRole('button', { name: 'Edit Name' }).click();
    await page.getByRole('textbox').fill('Changed Name');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page.getByText(originalName)).toBeVisible();
    await expect(page.getByText('Changed Name')).not.toBeVisible();
  });

  test('logout redirects to login page', async ({ page, request }) => {
    const email = `e2e-logout-${Date.now()}@example.com`;
    await registerUser(request, email, 'Logout Test');

    await loginAndVerify(page, email);
    await page.getByRole('button', { name: 'Logout' }).click();

    await expect(page).toHaveURL(Routes.Login);
  });
});

test.describe('Home Page', () => {
  test('shows login and profile links', async ({ page }) => {
    await page.goto(Routes.Home);

    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Profile' })).toBeVisible();
  });

  test('navigates to login page when clicking login link', async ({ page }) => {
    await page.goto(Routes.Home);

    await page.getByRole('link', { name: 'Login' }).click();

    await expect(page).toHaveURL(Routes.Login);
  });
});
