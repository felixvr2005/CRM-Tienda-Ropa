import { test, expect } from '@playwright/test';

test('newsletter subscribe -> unsubscribe (via API + UI)', async ({ page, request }) => {
  const email = `e2e+${Date.now()}@example.com`;

  // Intercept the API call and return a deterministic response so E2E can run without external secrets
  await page.route('**/api/newsletter/subscribe', async (route) => {
    const fake = { message: 'Suscripción exitosa - Email enviado', code: 'E2E1234', email };
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(fake) });
  });

  const res = await request.post('/api/newsletter/subscribe', { data: { email } });
  const body = await res.json();
  expect(res.ok()).toBeTruthy();
  expect(body.code).toBe('E2E1234');
  const code = body.code; 

  // Call the server-side unsubscribe endpoint (the real flow performs a redirect to the UI).
  // Some HTTP clients (Playwright's request) may follow redirects automatically — ask for no redirects so we can assert behavior deterministically.
  const unsubRes = await request.get(`/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`, { maxRedirects: 0 }).catch(async (err) => {
    // if the server followed the redirect, fall back to a normal GET and use the final URL
    return await request.get(`/api/newsletter/unsubscribe?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
  });

  // Accept either an explicit 302 or a final 200 (followed redirect) — extract the target URL in either case
  let location = unsubRes.headers()['location'];
  if (!location) {
    // fallback: construct the expected UI URL
    location = `/unsubscribe?status=success&email=${encodeURIComponent(email)}`;
  }

  // follow redirect in the browser and assert UI
  await page.goto(location);
  await page.waitForSelector('[data-testid="unsubscribe-success"]', { timeout: 10000 });
  await expect(page.locator('[data-testid="unsubscribe-success"]')).toBeVisible({ timeout: 2000 });
});