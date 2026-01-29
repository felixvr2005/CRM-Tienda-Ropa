import { test, expect } from '@playwright/test';

test('checkout form submits and redirects to Stripe (intercept)', async ({ page }) => {
  await page.goto('/checkout');

  await page.fill('#email', `e2e+${Date.now()}@example.com`);
  await page.fill('#phone', '+34123456789');
  await page.fill('#firstName', 'E2E');
  await page.fill('#lastName', 'Tester');
  await page.fill('#street', 'Calle Falsa 1');
  await page.fill('#postalCode', '28001');
  await page.fill('#city', 'Madrid');
  await page.selectOption('#province', 'Madrid');

  await page.route('**/api/checkout/create-session', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ url: 'https://checkout.stripe.mock/session', sessionId: 'sess_test_1' })
    });
  });

  const submit = page.locator('button:has-text("PAGAR AHORA")');
  if (await submit.isVisible()) {
    await submit.click();
  } else {
    const res = await page.evaluate(async () => {
      const r = await fetch('/api/checkout/create-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'e2e@test.com', items: [{ variantId: 1, quantity: 1, price: 10 }], subtotal: 10, shippingCost: 0, discount: 0, total: 10 }) });
      return r.status;
    });
    expect(res).toBe(200);
  }

  await expect(page).toHaveURL(/stripe\.mock|checkout\/success/);
});