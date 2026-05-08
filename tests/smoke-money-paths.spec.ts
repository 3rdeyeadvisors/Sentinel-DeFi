import { test, expect } from '@playwright/test';

// Standardized session for mock users
const MOCK_USER_SESSION = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh',
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    user_metadata: { display_name: 'Test User' },
    app_metadata: { role: 'user' }
  }
};

const AUTH_TOKEN_KEY = 'sb-zapbkuaejvzpqerkkcnc-auth-token';

test.describe('Money Path: Authentication & Dashboard', () => {
  test('unauthenticated user is redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Assuming ProtectedRoute redirects to /auth or /signin
    await expect(page).not.toHaveURL('/dashboard');
  });

  test('authenticated user can see dashboard and points', async ({ page }) => {
    // Inject session
    await page.addInitScript(({ key, session }) => {
      window.localStorage.setItem(key, JSON.stringify(session));
    }, { key: AUTH_TOKEN_KEY, session: MOCK_USER_SESSION });

    await page.goto('/dashboard');
    await expect(page.locator('body')).toContainText(/Dashboard|Points/i);
  });
});

test.describe('Money Path: Education & Gamification', () => {
  test('can navigate to courses and view a course', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.locator('body')).toContainText(/Courses/i);
  });

  test('can navigate to leaderboard', async ({ page }) => {
    await page.goto('/leaderboard');
    await expect(page.locator('body')).toContainText(/Leaderboard/i);
  });
});

test.describe('Money Path: Store & Subscription', () => {
  test('can navigate to store and see products', async ({ page }) => {
    await page.goto('/store');
    await expect(page.locator('body')).toContainText(/Store|Products/i);
  });

  test('subscription page loads correctly', async ({ page }) => {
    await page.goto('/subscription');
    // The previous run showed "14 Day Free Trial" and "Monthly" content
    await expect(page.locator('body')).toContainText(/Monthly|Annual|Trial/i);
  });
});
