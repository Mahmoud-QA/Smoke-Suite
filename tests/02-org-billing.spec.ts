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

  // Dismiss onboarding modal by clicking its Ã— close button
  const modalClose = page.locator('.v-overlay--active .v-btn--icon, [role="dialog"] .v-btn--icon').first();
  if (await modalClose.isVisible({ timeout: 3000 }).catch(() => false)) {
    await modalClose.click();
    await page.waitForTimeout(500);
  }
  console.log('Logged in. Current URL:', page.url());
}

test.describe('TC-12 | Authenticated user creates a new organisation', () => {
  test('add organization via org switcher dropdown', async ({ page }) => {
    await loginAndDismissModal(page);

    // Navigate to settings/billing where the header is unblocked
    await page.goto(`${BASE}/settings/billing`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    // Dismiss modal if present on settings page too
    const modalClose2 = page.locator('.v-overlay--active .v-btn--icon').first();
    if (await modalClose2.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modalClose2.click();
      await page.waitForTimeout(400);
    }
    await page.screenshot({ path: 'screenshots/tc12-dashboard.png' });

    // Org switcher â€” use the [class*="org"] selector that worked in nav exploration
    const orgChip = page.locator('[class*="org"], [class*="workspace"]').first();
    await orgChip.click();

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/tc12-org-dropdown.png' });
    console.log('Org dropdown URL:', page.url());

    // Check for "Add Organization" option
    const addOrgOption = page.locator('text=Add Organization').first();
    const hasAddOrg = await addOrgOption.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Add Organization option visible:', hasAddOrg);

    if (hasAddOrg) {
      await addOrgOption.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'screenshots/tc12-create-org-form.png' });
      console.log('Create org form URL:', page.url());

      const inputs = await page.locator('input:not([type="hidden"])').all();
      for (const input of inputs) {
        const label = await input.getAttribute('placeholder') ?? '';
        console.log('Create org field:', { type: await input.getAttribute('type'), placeholder: label });
      }

      // Check if there's a restriction message
      const restrictionText = await page.locator('text=/restrict|remain|default/i').first().innerText().catch(() => '');
      console.log('Restriction message:', restrictionText);
    }

    const bodyText = await page.locator('body').innerText();
    console.log('Page content (excerpt):', bodyText.substring(0, 600));
  });
});

test.describe('TC-18 | Admin invites a new member by email', () => {
  test('find members page via Settings sidebar', async ({ page }) => {
    await loginAndDismissModal(page);

    // Navigate to settings â€” the sidebar has Settings with submenu
    await page.goto(`${BASE}/settings`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Dismiss modal again if shown
    const modalClose = page.locator('.v-overlay--active .v-btn--icon').first();
    if (await modalClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modalClose.click();
      await page.waitForTimeout(400);
    }

    await page.screenshot({ path: 'screenshots/tc18-settings-page.png' });
    console.log('Settings URL:', page.url());

    // Capture full sidebar text to find members/team link
    const sidebarText = await page.locator('.v-navigation-drawer, aside, nav').first().innerText().catch(() => '');
    console.log('Sidebar navigation text:', sidebarText.substring(0, 400));

    // Get all sidebar links
    const sidebarLinks = await page.locator('.v-navigation-drawer a[href], aside a[href], nav a[href]').all();
    for (const link of sidebarLinks) {
      const href = await link.getAttribute('href');
      const text = await link.innerText().catch(() => '');
      console.log(`Sidebar link: ${href} â€” "${text.trim()}"`);
    }

    // Click Settings submenu to expand it
    const settingsLink = page.locator('.v-navigation-drawer a, aside a').filter({ hasText: /^settings$/i }).first();
    if (await settingsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await settingsLink.click();
      await page.waitForTimeout(300);
    }

    // Look for Members/Team link
    const membersLink = page.locator('a').filter({ hasText: /members|team|users/i }).first();
    if (await membersLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      const href = await membersLink.getAttribute('href');
      console.log('Members link found at:', href);
      await membersLink.click();
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.screenshot({ path: 'screenshots/tc18-members-page.png' });
      console.log('Members page URL:', page.url());
    }

    // Check for invite button on the members page
    const inviteBtn = page.getByRole('button', { name: /invite|add.?member|add.?user/i }).first();
    const hasInviteBtn = await inviteBtn.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Has invite button:', hasInviteBtn);
    if (hasInviteBtn) {
      await inviteBtn.click();
      await page.screenshot({ path: 'screenshots/tc18-invite-modal.png' });
      const inputs = await page.locator('input:not([type="hidden"]), select').all();
      for (const input of inputs) {
        console.log('Invite form field:', {
          type: await input.getAttribute('type'),
          placeholder: await input.getAttribute('placeholder'),
          label: await input.getAttribute('aria-label'),
        });
      }
    }

    const bodyText = await page.locator('body').innerText();
    console.log('Page content:', bodyText.substring(0, 800));
  });
});

test.describe('TC-15 | Organisation owner subscribes to the Pro plan', () => {
  test('billing page at /settings/billing shows Stripe portal', async ({ page }) => {
    await loginAndDismissModal(page);

    await page.goto(`${BASE}/settings/billing`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Dismiss modal
    const modalClose = page.locator('.v-overlay--active .v-btn--icon').first();
    if (await modalClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modalClose.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'screenshots/tc15-billing-page.png' });
    console.log('Billing URL:', page.url());

    const bodyText = await page.locator('body').innerText();
    console.log('Billing page content:', bodyText.substring(0, 800));

    // Check for Stripe portal content
    const hasStripe = bodyText.toLowerCase().includes('stripe');
    const hasSubscription = bodyText.toLowerCase().includes('subscription') || bodyText.toLowerCase().includes('plan');
    console.log('Has Stripe reference:', hasStripe);
    console.log('Has subscription/plan info:', hasSubscription);

    // Look for plan cards or subscription buttons
    const planCards = await page.locator('[class*="plan"], [class*="pricing"], [class*="tier"], .v-card').all();
    console.log('Plan/card elements:', planCards.length);

    // Check for Stripe portal button
    const stripeBtn = page.locator('button, a').filter({ hasText: /manage|portal|stripe|payment|subscribe|upgrade/i }).first();
    console.log('Stripe/manage button visible:', await stripeBtn.isVisible({ timeout: 2000 }).catch(() => false));
    if (await stripeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('Button text:', await stripeBtn.innerText());
    }

    expect(hasStripe || hasSubscription, 'Billing page should reference Stripe or subscription').toBeTruthy();
  });
});

test.describe('TC-302 | Price management actions on billing page', () => {
  test('billing page content and available actions', async ({ page }) => {
    await loginAndDismissModal(page);

    await page.goto(`${BASE}/settings/billing`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const modalClose = page.locator('.v-overlay--active .v-btn--icon').first();
    if (await modalClose.isVisible({ timeout: 2000 }).catch(() => false)) {
      await modalClose.click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'screenshots/tc302-billing-page.png' });

    // Document all buttons and links on the billing page
    const buttons = await page.locator('button, a[href]').all();
    const buttonData: string[] = [];
    for (const btn of buttons) {
      const text = (await btn.innerText().catch(() => '')).trim();
      const href = await btn.getAttribute('href');
      if (text.length > 0) buttonData.push(href ? `[link:${href}] ${text}` : text);
    }
    console.log('Billing page actions:', buttonData);

    const bodyText = await page.locator('body').innerText();
    console.log('Full billing content:', bodyText.substring(0, 1000));
  });
});

test.describe('TC-440 | No billing plan data exposed to unauthenticated visitors', () => {
  test('unauthenticated page source does not contain billing plan details', async ({ browser }) => {
    const freshContext = await browser.newContext();
    const page = await freshContext.newPage();

    await page.goto(`${BASE}/settings/billing`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const bodyText = await page.locator('body').innerText().catch(() => '');

    const hasPlanName = bodyText.toLowerCase().includes('starter') || bodyText.toLowerCase().includes('professional') || bodyText.toLowerCase().includes('enterprise');
    const hasPrice = /\$\d+/.test(bodyText);
    const hasRenewalDate = bodyText.toLowerCase().includes('renewal') || bodyText.toLowerCase().includes('next billing');
    const hasSeatCount = /\d+\s*\/\s*\d+\s*(seat|user)/i.test(bodyText);

    console.log('Plan name exposed:', hasPlanName);
    console.log('Price figures exposed:', hasPrice);
    console.log('Renewal date exposed:', hasRenewalDate);
    console.log('Seat count exposed:', hasSeatCount);
    console.log('Page content (first 300):', bodyText.substring(0, 300));

    expect(hasPlanName || hasPrice || hasRenewalDate || hasSeatCount,
      'No billing plan data should be accessible to unauthenticated users').toBeFalsy();

    await freshContext.close();
  });
});
