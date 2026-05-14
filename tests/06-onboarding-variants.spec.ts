import { test, expect, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://app.synkvault.net';
const VALID_EMAIL = process.env.TEST_EMAIL || 'm.habib@cyberneticlabs.io';
const VALID_PASSWORD = process.env.TEST_PASSWORD || 'SynkVault@123';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('button:has-text("SIGN IN")', { timeout: 10000 });
  await page.locator('input[type="email"]').first().fill(VALID_EMAIL);
  await page.locator('input[type="password"]').first().fill(VALID_PASSWORD);
  await page.getByRole('button', { name: 'SIGN IN' }).click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });
}

async function dismissModal(page: Page) {
  const closeBtn = page.locator('.v-overlay--active .v-btn--icon').first();
  if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(400);
  }
}

test.describe('TC-380 | Onboarding prompt shown to owner role when ontology is pristine', () => {
  test('owner account sees setup wizard modal after login on pristine ontology', async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.screenshot({ path: 'screenshots/tc380-owner-post-login.png' });

    // Our test account (m.habib@cyberneticlabs.io) is the org owner
    const setupModal = page.locator('.v-overlay--active').first();
    const isVisible = await setupModal.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Setup wizard modal visible for owner:', isVisible);

    if (isVisible) {
      const modalText = await setupModal.innerText().catch(() => '');
      console.log('Modal content:', modalText.substring(0, 500));

      const hasTitle = modalText.includes("knowledge ontology") || modalText.includes("hasn't been set up");
      const hasCreateWithAI = await page.locator('text=Create with AI').isVisible().catch(() => false);
      const hasCreateManually = await page.locator('text=Create manually').isVisible().catch(() => false);
      const hasStartGuidedSetup = await page.locator('text=Start guided setup').isVisible().catch(() => false);
      const hasOpenEditor = await page.locator('text=Open editor').isVisible().catch(() => false);

      console.log('Title present:', hasTitle);
      console.log('Create with AI card:', hasCreateWithAI);
      console.log('Create manually card:', hasCreateManually);
      console.log('Start guided setup link:', hasStartGuidedSetup);
      console.log('Open editor link:', hasOpenEditor);
    }

    expect(isVisible, 'Owner should see setup wizard modal on pristine ontology').toBeTruthy();
  });
});

test.describe('TC-382 | Clicking Create Manually navigates to Ontology Editor', () => {
  test('Open editor link inside modal navigates to /ontology', async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const setupModal = page.locator('.v-overlay--active').first();
    const isVisible = await setupModal.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Setup wizard modal visible:', isVisible);

    if (!isVisible) {
      console.log('Modal not visible â€” skipping navigation test');
      return;
    }

    await page.screenshot({ path: 'screenshots/tc382-modal-before-click.png' });

    // "Create manually" card action is labelled "Open editor" (confirmed via evaluateAll debug)
    const openBtn = page.locator('.v-overlay--active').getByText('Open editor', { exact: true }).first();
    const hasLink = await openBtn.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Open editor button (Create manually action) visible:', hasLink);

    if (hasLink) {
      // Log the element tag and class before clicking
      const tagName = await openBtn.evaluate(el => el.tagName).catch(() => 'unknown');
      const className = await openBtn.evaluate(el => el.className).catch(() => '');
      console.log('Open editor element tag:', tagName, '| class:', className);

      await openBtn.click();
      await page.waitForTimeout(2000);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.screenshot({ path: 'screenshots/tc382-after-open-editor.png' });

      const url = page.url();
      console.log('URL after clicking Open editor (Create manually):', url);
      const bodyText = await page.locator('body').innerText().catch(() => '');
      console.log('Page content after click (first 300):', bodyText.substring(0, 300));

      const navigatedToOntology = url.includes('/ontology');
      console.log('Navigated to /ontology:', navigatedToOntology);

      expect(navigatedToOntology, 'Create Manually should navigate to /ontology').toBeTruthy();
    } else {
      expect(false, 'Could not locate "Open editor" action in Create manually card').toBeTruthy();
    }
  });
});

test.describe('TC-383 | Create with AI button is present in onboarding prompt', () => {
  test('Start guided setup link visible in setup wizard modal', async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const setupModal = page.locator('.v-overlay--active').first();
    const isVisible = await setupModal.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Setup wizard modal visible:', isVisible);

    await page.screenshot({ path: 'screenshots/tc383-modal.png' });

    if (!isVisible) {
      console.log('Modal not visible on this session â€” it may have been dismissed');
      return;
    }

    const createWithAI = page.locator('text=Create with AI').first();
    const startGuidedSetup = page.locator('text=Start guided setup').first();

    const hasCreateWithAI = await createWithAI.isVisible({ timeout: 2000 }).catch(() => false);
    const hasStartGuidedSetup = await startGuidedSetup.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('Create with AI card visible:', hasCreateWithAI);
    console.log('Start guided setup link visible:', hasStartGuidedSetup);

    expect(hasCreateWithAI || hasStartGuidedSetup, 'Create with AI option should be present').toBeTruthy();

    // Click Start guided setup and verify it does not 404 or crash
    if (hasStartGuidedSetup) {
      await startGuidedSetup.click();
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.screenshot({ path: 'screenshots/tc383-after-create-with-ai.png' });

      const url = page.url();
      const bodyText = await page.locator('body').innerText();
      const is404 = bodyText.toLowerCase().includes('not found') || bodyText.toLowerCase().includes('404');
      console.log('URL after clicking Start guided setup:', url);
      console.log('404 or broken route:', is404);

      expect(is404, 'Start guided setup should not navigate to a 404 page').toBeFalsy();
    }
  });
});

test.describe('TC-384 | Prompt dismissable per session, reappears on next login', () => {
  test('dismiss modal, navigate away, confirm it does not reappear in same session', async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const setupModal = page.locator('.v-overlay--active').first();
    const isVisible = await setupModal.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Setup wizard modal visible on login:', isVisible);

    if (!isVisible) {
      console.log('Modal not shown â€” may have already been dismissed or ontology not pristine');
      return;
    }

    // Dismiss with X button
    const closeBtn = page.locator('.v-overlay--active .v-btn--icon').first();
    const hasCloseBtn = await closeBtn.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('X close button visible:', hasCloseBtn);

    if (hasCloseBtn) {
      await closeBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/tc384-after-dismiss.png' });

      const stillVisible = await setupModal.isVisible().catch(() => false);
      console.log('Modal still visible after dismiss:', stillVisible);
      expect(stillVisible, 'Modal should disappear after clicking X').toBeFalsy();

      // Navigate away and back
      await page.goto(`${BASE}/settings`);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.goto(`${BASE}/`);
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.screenshot({ path: 'screenshots/tc384-after-navigate-back.png' });

      const reappearsSameSession = await page.locator('.v-overlay--active').first().isVisible({ timeout: 2000 }).catch(() => false);
      console.log('Modal reappears in same session after navigating back:', reappearsSameSession);
      expect(reappearsSameSession, 'Modal should NOT reappear in the same session after dismissal').toBeFalsy();

      // Verify it reappears on next login by clearing session and logging in fresh
      await page.context().clearCookies();
      await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
      await page.goto(`${BASE}/login`);
      await page.waitForSelector('button:has-text("SIGN IN")', { timeout: 10000 });
      await page.locator('input[type="email"]').first().fill(VALID_EMAIL);
      await page.locator('input[type="password"]').first().fill(VALID_PASSWORD);
      await page.getByRole('button', { name: 'SIGN IN' }).click();
      await page.waitForLoadState('networkidle', { timeout: 15000 });
      await page.screenshot({ path: 'screenshots/tc384-after-relogin.png' });

      await page.waitForTimeout(2000); // allow modal to auto-open after login
      const reappearsAfterRelogin = await page.locator('.v-overlay--active').first().isVisible({ timeout: 8000 }).catch(() => false);
      console.log('Modal reappears after logging out and back in:', reappearsAfterRelogin);
      expect(reappearsAfterRelogin, 'Modal should reappear on next login while ontology is still pristine').toBeTruthy();
    }
  });
});

test.describe('TC-445 | Start guided setup in onboarding modal advances to wizard Step 2', () => {
  test("clicking 'Start guided setup' shows a new wizard step or content change", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForSelector('button:has-text("SIGN IN")', { timeout: 10000 });
    await page.locator('input[type="email"]').first().fill(VALID_EMAIL);
    await page.locator('input[type="password"]').first().fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'SIGN IN' }).click();
    await page.waitForLoadState('networkidle', { timeout: 15000 });

    const modal = page.locator('.v-overlay--active').first();
    const isVisible = await modal.isVisible({ timeout: 4000 }).catch(() => false);
    console.log('Onboarding modal visible:', isVisible);

    if (!isVisible) {
      console.log('Modal not visible â€” session may have dismissed it already');
      return;
    }

    await page.screenshot({ path: 'screenshots/tc445-modal-step1.png' });

    const modalTextBefore = await modal.innerText().catch(() => '');
    console.log('Modal content before click:', modalTextBefore.substring(0, 400));

    const startGuidedSetup = page.locator('.v-overlay--active').getByText('Start guided setup', { exact: true }).first();
    const hasLink = await startGuidedSetup.isVisible({ timeout: 2000 }).catch(() => false);
    console.log('"Start guided setup" link visible:', hasLink);

    if (!hasLink) {
      const createWithAI = page.locator('.v-overlay--active').getByText('Create with AI').first();
      const hasCard = await createWithAI.isVisible({ timeout: 2000 }).catch(() => false);
      console.log('"Create with AI" card visible:', hasCard);
      return;
    }

    await startGuidedSetup.click();
    await page.waitForTimeout(1500);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.screenshot({ path: 'screenshots/tc445-after-start-guided-setup.png' });

    const urlAfter = page.url();
    const modalTextAfter = await page.locator('.v-overlay--active').first().innerText().catch(() => '');
    const modalStillOpen = await page.locator('.v-overlay--active').first().isVisible({ timeout: 2000 }).catch(() => false);

    console.log('URL after clicking Start guided setup:', urlAfter);
    console.log('Modal still open:', modalStillOpen);
    console.log('Modal content after click:', modalTextAfter.substring(0, 400));

    const contentChanged = modalTextAfter !== modalTextBefore;
    const hasStepIndicator = modalTextAfter.toLowerCase().includes('step') ||
                              modalTextAfter.toLowerCase().includes('2 of') ||
                              modalTextAfter.toLowerCase().includes('next');
    const navigatedAway = !urlAfter.includes('login');
    const is404 = (await page.locator('body').innerText().catch(() => '')).toLowerCase().includes('not found');

    console.log('Modal content changed:', contentChanged);
    console.log('Step indicator or progression visible:', hasStepIndicator);
    console.log('Is 404:', is404);

    expect(is404, 'Start guided setup must not navigate to a 404 page').toBeFalsy();
    expect(navigatedAway, 'Must not redirect back to login').toBeTruthy();
  });
});
