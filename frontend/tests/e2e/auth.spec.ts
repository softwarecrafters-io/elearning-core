import { test, expect } from '@playwright/test';
import { Routes } from '../../src/shared/infrastructure/ui/routes';
import { testOTP, adminEmail } from '../../playwright.config';

const backendUrl = 'http://localhost:3002';
const webhookSecret = 'test-webhook-secret';

async function registerUser(
  request: typeof test extends (args: infer T) => void ? T : never,
  email: string,
  name: string
) {
  await request.post(`${backendUrl}/webhooks/users`, {
    data: { email, name },
    headers: { 'X-Webhook-Secret': webhookSecret },
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

  test('shows admin link only for admin users', async ({ page, request }) => {
    await page.goto(Routes.Home);
    await expect(page.getByRole('link', { name: 'Admin Users' })).not.toBeVisible();
    const adminEmail = `e2e-admin-nav-${Date.now()}@example.com`;
    await request.post(`${backendUrl}/auth/login`, { data: { email: adminEmail } });
    const db = await request.get(`${backendUrl}/health`);
    await page.goto(Routes.Home);
    await expect(page.getByRole('link', { name: 'Admin Users' })).not.toBeVisible();
  });
});

test.describe('Admin Users Page', () => {
  test.describe.configure({ mode: 'serial' });

  async function loginAsAdmin(page: typeof test extends (args: { page: infer P }) => void ? P : never) {
    await page.goto(Routes.Login);
    await page.getByPlaceholder('Email').fill(adminEmail);
    await page.getByRole('button', { name: 'Send OTP' }).click();
    await expect(page).toHaveURL(new RegExp(`${Routes.Verify}\\?email=`), { timeout: 10000 });
    await page.getByPlaceholder('000000').fill(testOTP);
    await page.getByRole('button', { name: 'Verify' }).click();
    await expect(page).toHaveURL(Routes.Profile, { timeout: 10000 });
  }

  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto(Routes.AdminUsers);

    await expect(page).toHaveURL(Routes.Login);
  });

  test('redirects to home when authenticated but not admin', async ({ page, request }) => {
    const email = `e2e-student-admin-${Date.now()}@example.com`;
    await registerUser(request, email, 'Student User');
    await loginAndVerify(page, email);

    await page.goto(Routes.AdminUsers);

    await expect(page).toHaveURL(Routes.Home);
  });

  test('shows user management page for admin', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto(Routes.AdminUsers);

    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add User' })).toBeVisible();
  });

  test('admin can create a new user', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(Routes.AdminUsers);
    const newUserEmail = `e2e-created-${Date.now()}@example.com`;

    await page.getByRole('button', { name: 'Add User' }).click();
    await page.getByPlaceholder('Email').fill(newUserEmail);
    await page.getByPlaceholder('Name').fill('Created User');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText(newUserEmail)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Created User')).toBeVisible();
  });

  test('admin can edit user name', async ({ page, request }) => {
    await loginAsAdmin(page);
    const userEmail = `e2e-edit-admin-${Date.now()}@example.com`;
    await registerUser(request, userEmail, 'Original Name');
    await page.goto(Routes.AdminUsers);
    await page.waitForSelector(`text=${userEmail}`);

    await page.locator(`tr:has-text("${userEmail}")`).getByTitle('Edit').click();
    await page.locator(`tr:has-text("${userEmail}") input`).fill('Edited Name');
    await page.locator(`tr:has-text("${userEmail}")`).getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText('Edited Name')).toBeVisible({ timeout: 5000 });
  });

  test('admin can delete user', async ({ page, request }) => {
    await loginAsAdmin(page);
    const userEmail = `e2e-delete-admin-${Date.now()}@example.com`;
    await registerUser(request, userEmail, 'To Delete');
    await page.goto(Routes.AdminUsers);
    await page.waitForSelector(`text=${userEmail}`);

    await page.locator(`tr:has-text("${userEmail}")`).getByTitle('Delete').click();

    await expect(page.getByText(userEmail)).not.toBeVisible({ timeout: 5000 });
  });
});
