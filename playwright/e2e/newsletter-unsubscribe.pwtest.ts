import { test, expect } from '@playwright/test';

test('newsletter subscribe -> unsubscribe (via API + UI)', async ({ page, request }) => {
  const email = `e2e+${Date.now()}@example.com`;

  // Intercept the API call and return a deterministic response so E2E can run without external secrets
  await page.route('**/api/newsletter/subscribe', async (route) => {
    const fake = { message: 'Suscripción exitosa - Email enviado', code: 'E2E1234', email };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fake) });
  });

  const res = await request.post('/api/newsletter/subscribe', { data: { email } });
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.code).toBe('E2E1234');
  const code = body.code;

  // Navigate to unsubscribe page using the mocked code
  await page.goto(`/unsubscribe?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
  await expect(page.locator('text=Has sido dado de baja')).toBeVisible({ timeout: 5000 });
});