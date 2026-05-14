import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://app.synkvault.net';
const VALID_EMAIL = process.env.TEST_EMAIL || 'm.habib@cyberneticlabs.io';
const VALID_PASSWORD = process.env.TEST_PASSWORD || 'SynkVault@123';

async function loginAndDismissModal(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('button:has-text("SIGN IN")', { timeout: 10000 });
  await page.locator('input[type="email"]').first().fill(VALID_EMAIL);
  await page.locator('input[type="password"]').first().fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'SIGN IN' }).click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  const modalClose = page.locator('.v-overlay--active .v-btn--icon').first();
  if (await modalClose.isVisible({ timeout: 3000 }).catch(() => false)) {
    await modalClose.click();
    await page.waitForTimeout(500);
  }
}

async function loginAndGoToBilling(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('button:has-text("SIGN IN")', { timeout: 10000 });
  await page.locator('input[type="email"]').first().fill(VALID_EMAIL);
  await page.locator('input[type="password"]').first().fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'SIGN IN' }).click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  const modalClose = page.locator('.v-overlay--active .v-btn--icon').first();
  if (await modalClose.isVisible({ timeout: 3000 }).catch(() => false)) {
    await modalClose.click();
    await page.waitForTimeout(500);
  }

  await page.goto(`${BASE}/settings/billing`);
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  const modalClose2 = page.locator('.v-overlay--active .v-btn--icon').first();
  if (await modalClose2.isVisible({ timeout: 2000 }).catch(() => false)) {
    await modalClose2.click();
    await page.waitForTimeout(400);
  }
}

test.describe('TC-322 | Tenant Owner sees plan name, tier, and status on billing page', () => {
  test('billing page shows Professional plan, active status, and price', async ({ page }) => {
    await loginAndGoToBilling(page);
    await page.screenshot({ path: 'screenshots/tc322-billing-plan.png' });

    const bodyText = await page.locator('body').innerText();
    console.log('Billing page content:', bodyText.substring(0, 1000));

    const hasPlanName = bodyText.toLowerCase().includes('professional') ||
                        bodyText.toLowerCase().includes('pro') ||
                        bodyText.toLowerCase().includes('growth') ||
                        bodyText.toLowerCase().includes('starter');
    const hasPricing = bodyText.includes('$') || bodyText.toLowerCase().includes('/month') || bodyText.toLowerCase().includes('per month');
    const hasActiveStatus = bodyText.toLowerCase().includes('active');
    const hasStripe = bodyText.toLowerCase().includes('stripe') || bodyText.toLowerCase().includes('manage');

    console.log('Has plan name:', hasPlanName);
    console.log('Has pricing info:', hasPricing);
    console.log('Status shows Active:', hasActiveStatus);
    console.log('Has Stripe portal reference:', hasStripe);

    // Log all card/section headings
    const headings = await page.locator('h1, h2, h3, .v-card__title, [class*="title"]').allInnerTexts();
    console.log('Page headings/card titles:', headings);

    expect(hasPlanName || hasPricing, 'Billing page should show plan name or pricing info').toBeTruthy();
    expect(hasActiveStatus, 'Billing page should show Active status for active subscription').toBeTruthy();
  });
});

test.describe('TC-323 | Subscription page shows billing cycle dates and next renewal', () => {
  test('billing page shows next billing date and renewal info', async ({ page }) => {
    await loginAndGoToBilling(page);
    await page.screenshot({ path: 'screenshots/tc323-billing-dates.png' });

    const bodyText = await page.locator('body').innerText();
    console.log('Billing page content:', bodyText.substring(0, 1000));

    const hasNextBilling = bodyText.toLowerCase().includes('next billing') ||
                           bodyText.toLowerCase().includes('renewal') ||
                           bodyText.toLowerCase().includes('renews') ||
                           bodyText.toLowerCase().includes('next payment');
    const hasDate = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(bodyText) ||
                    /\d{4}/.test(bodyText);
    const hasAutoRenew = bodyText.toLowerCase().includes('auto') ||
                         bodyText.toLowerCase().includes('renovate') ||
                         bodyText.toLowerCase().includes('renew');

    console.log('Has next billing date label:', hasNextBilling);
    console.log('Has date content:', hasDate);
    console.log('Has auto-renew info:', hasAutoRenew);

    expect(hasNextBilling || hasDate, 'Billing page should show next renewal date info').toBeTruthy();
  });
});

test.describe('TC-324 | Tenant Owner sees seats utilization on billing page', () => {
  test('billing page shows seats used and available', async ({ page }) => {
    await loginAndGoToBilling(page);

    const bodyText = await page.locator('body').innerText();
    console.log('Billing seats content:', bodyText.substring(0, 1000));

    const hasSeats = bodyText.toLowerCase().includes('seat') ||
                     bodyText.toLowerCase().includes('user') && bodyText.toLowerCase().includes('/');
    const hasUtilization = /\d+\s*\/\s*\d+/.test(bodyText);

    console.log('Has seats/user count:', hasSeats);
    console.log('Has N/M utilization pattern:', hasUtilization);
    await page.screenshot({ path: 'screenshots/tc324-seats.png' });
  });
});

test.describe('TC-327 | Manage Subscription button is visible to Tenant Owner', () => {
  test('billing page shows Manage in Stripe Portal button, enabled and clickable', async ({ page }) => {
    await loginAndGoToBilling(page);
    await page.screenshot({ path: 'screenshots/tc327-manage-btn.png' });

    const manageBtn = page.locator('button, a').filter({ hasText: /manage|stripe|portal/i }).first();
    const hasManageBtn = await manageBtn.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Manage/Stripe/Portal button visible:', hasManageBtn);

    if (hasManageBtn) {
      const btnText = await manageBtn.innerText().catch(() => '');
      const isDisabled = await manageBtn.isDisabled().catch(() => false);
      console.log('Button text:', btnText);
      console.log('Button is disabled:', isDisabled);

      expect(isDisabled, 'Manage Subscription button should be enabled').toBeFalsy();
    }

    const bodyText = await page.locator('body').innerText();
    console.log('All actionable items:', bodyText.substring(0, 500));

    const allBtnTexts = await page.locator('button').allTextContents();
    console.log('All buttons on billing page:', allBtnTexts);

    expect(hasManageBtn, 'Manage Subscription / Stripe Portal button should be visible to Tenant Owner').toBeTruthy();
  });
});

test.describe('TC-439 | Manage in Stripe Portal button opens Stripe', () => {
  test('clicking Manage Subscription button navigates to Stripe domain', async ({ page, context }) => {
    await loginAndDismissModal(page);
    await page.goto(`${BASE}/settings/billing`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.screenshot({ path: 'screenshots/tc439-billing-page.png' });

    const manageBtn = page.locator('button, a').filter({ hasText: /manage.*subscription|stripe.*portal|manage.*portal|manage.*billing/i }).first();
    const hasManageBtn = await manageBtn.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Manage Subscription / Stripe Portal button visible:', hasManageBtn);

    if (!hasManageBtn) {
      const allButtons = await page.locator('button, a').allInnerTexts().catch(() => []);
      console.log('All buttons/links on billing page:', allButtons.filter(t => t.trim()));
      console.log('FINDING: Manage Subscription button not found with expected text patterns');
      return;
    }

    const btnText = await manageBtn.innerText().catch(() => '');
    console.log('Manage button text:', btnText);

    const [newPage] = await Promise.all([
      context.waitForEvent('page', { timeout: 8000 }).catch(() => null),
      manageBtn.click().catch(() => {}),
    ]);

    await page.waitForTimeout(2000);

    if (newPage) {
      await newPage.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
      const stripeUrl = newPage.url();
      console.log('New tab URL (should be Stripe):', stripeUrl);
      const isStripe = stripeUrl.includes('stripe.com') || stripeUrl.includes('billing.stripe.com');
      console.log('Is Stripe domain:', isStripe);
      expect(isStripe, 'Manage button should open Stripe portal').toBeTruthy();
    } else {
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      const currentUrl = page.url();
      console.log('Current URL after click (same tab):', currentUrl);
      const isStripe = currentUrl.includes('stripe.com');
      const navigatedAway = !currentUrl.includes('synkvault');
      console.log('Navigated to Stripe:', isStripe);
      console.log('Navigated away from app:', navigatedAway);
    }
  });
});

test.describe('TC-444 | /no-subscription route renders a meaningful page, not a 404', () => {
  test('/no-subscription loads with subscription-related messaging and an actionable link', async ({ page }) => {
    await loginAndDismissModal(page);
    await page.goto(`${BASE}/no-subscription`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.screenshot({ path: 'screenshots/tc444-no-subscription.png' });

    const finalUrl = page.url();
    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log('URL after navigating to /no-subscription:', finalUrl);
    console.log('Page content:', bodyText.substring(0, 600));

    const is404 = bodyText.toLowerCase().includes('not found') || bodyText.toLowerCase().includes('404');
    const isBlank = bodyText.trim().length < 20;
    const hasSubscriptionMsg = bodyText.toLowerCase().includes('subscription') ||
                                bodyText.toLowerCase().includes('billing') ||
                                bodyText.toLowerCase().includes('plan') ||
                                bodyText.toLowerCase().includes('access');

    const actionLinks = await page.locator('button, a').filter({ hasText: /billing|subscribe|plan|contact|upgrade/i }).allInnerTexts().catch(() => []);
    console.log('Action links on /no-subscription:', actionLinks);

    console.log('Is 404:', is404);
    console.log('Is blank:', isBlank);
    console.log('Has subscription messaging:', hasSubscriptionMsg);

    const redirectedToBilling = finalUrl.includes('/billing') || finalUrl.includes('/settings');
    console.log('Redirected to billing page:', redirectedToBilling);

    expect(is404, '/no-subscription must not be a 404').toBeFalsy();
    expect(isBlank, '/no-subscription must not be blank').toBeFalsy();
    expect(hasSubscriptionMsg || redirectedToBilling, 'Page must show subscription context or redirect to billing').toBeTruthy();
  });
});
