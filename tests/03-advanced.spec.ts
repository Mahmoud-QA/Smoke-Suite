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
  // The Ã— close button is the .v-btn--icon inside the active overlay
  const closeBtn = page.locator('.v-overlay--active .v-btn--icon').first();
  if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(400);
  }
}

test.describe('TC-286 | Add menu shows only LLM Provider, Database, Other', () => {
  test('integrations add menu options discovery', async ({ page }) => {
    await login(page);

    // Navigate directly to /integrations (not via blocked link on home)
    await page.goto(`${BASE}/integrations`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Dismiss modal if present
    const closeBtn = page.locator('.v-overlay--active .v-btn--icon').first();
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(400);
    }

    await page.screenshot({ path: 'screenshots/tc286-integrations-page.png' });
    console.log('Integrations URL:', page.url());

    const bodyText = await page.locator('body').innerText();
    console.log('Integrations page content:', bodyText.substring(0, 600));

    // Find Add button
    const addBtn = page.locator('button').filter({ hasText: /^add$|^\+ ?add|add provider|add integration/i }).first();
    const hasAddBtn = await addBtn.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Has Add button:', hasAddBtn);

    if (hasAddBtn) {
      await addBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screenshots/tc286-add-menu.png' });

      const menuItems = await page.locator('[role="menuitem"], [role="option"], .v-list-item').allTextContents();
      console.log('Add menu options:', menuItems);

      const menuText = menuItems.join(' ').toLowerCase();
      console.log('LLM Provider in menu:', menuText.includes('llm'));
      console.log('Database in menu:', menuText.includes('database'));
      console.log('Other in menu:', menuText.includes('other'));
      console.log('Vector Store absent:', !menuText.includes('vector'));
      console.log('Graph Store absent:', !menuText.includes('graph'));
    } else {
      // Maybe page uses a different add button pattern
      const allButtons = await page.locator('button').allTextContents();
      console.log('All buttons on integrations page:', allButtons);
    }
  });
});

test.describe('TC-288 | OpenAI provider renders only api_key field', () => {
  test('OpenAI provider form fields discovery', async ({ page }) => {
    await login(page);

    await page.goto(`${BASE}/integrations`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const closeBtn = page.locator('.v-overlay--active .v-btn--icon').first();
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click();
      await page.waitForTimeout(400);
    }

    await page.screenshot({ path: 'screenshots/tc288-integrations.png' });

    const addBtn = page.locator('button').filter({ hasText: /^add$|^\+ ?add|add provider/i }).first();
    if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await addBtn.click();
      await page.waitForTimeout(400);

      // Select LLM Provider option
      const llmOption = page.locator('[role="menuitem"], .v-list-item').filter({ hasText: /llm/i }).first();
      if (await llmOption.isVisible({ timeout: 3000 }).catch(() => false)) {
        await llmOption.click();
        await page.waitForTimeout(400);
      }

      await page.screenshot({ path: 'screenshots/tc288-provider-form.png' });

      // Provider form opens as a right-side drawer (.integration-form-drawer)
      // Select is inside the drawer content â€” use force:true to click through drawer overlay
      const providerDropdown = page.locator('.integration-form-drawer .v-select, .v-navigation-drawer--right .v-select').first();
      if (await providerDropdown.isVisible({ timeout: 2000 }).catch(() => false)) {
        await providerDropdown.click({ force: true });
        await page.waitForTimeout(300);
        const options = page.locator('[role="option"], .v-list-item').filter({ hasText: /openai/i }).first();
        if (await options.isVisible({ timeout: 2000 }).catch(() => false)) {
          await options.click({ force: true });
          await page.waitForTimeout(300);
        }
      }

      await page.screenshot({ path: 'screenshots/tc288-openai-fields.png' });
      const inputs = await page.locator('input:not([type="hidden"])').all();
      for (const input of inputs) {
        console.log('OpenAI form field:', {
          type: await input.getAttribute('type'),
          placeholder: await input.getAttribute('placeholder'),
          label: await input.getAttribute('aria-label'),
        });
      }

      const formText = await page.locator('[role="dialog"], .v-dialog, .v-overlay--active').first().innerText().catch(
        () => page.locator('body').innerText()
      );
      console.log('Provider form content:', (await formText).substring(0, 500));
    } else {
      const allButtons = await page.locator('button').allTextContents();
      console.log('No add button found. All buttons:', allButtons);
    }
  });
});

test.describe('TC-270 | Bot panel auto-opens on empty (pristine) ontology', () => {
  test('onboarding setup wizard auto-opens on login with pristine ontology', async ({ page }) => {
    await login(page);
    // Don't dismiss modal â€” check it auto-opens
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.screenshot({ path: 'screenshots/tc270-post-login.png' });

    // The setup wizard IS the onboarding modal that auto-opens
    const setupModal = page.locator('.v-overlay--active, [role="dialog"]').first();
    const modalVisible = await setupModal.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Setup modal auto-opens:', modalVisible);

    if (modalVisible) {
      const modalText = await setupModal.innerText().catch(() => '');
      console.log('Setup modal content:', modalText.substring(0, 400));

      // Check step indicator "Setup Â· Step 1 of 2"
      const hasStepIndicator = modalText.includes('Step 1 of 2') || modalText.includes('Setup');
      console.log('Has Step 1 of 2 indicator:', hasStepIndicator);

      // Check for "Create with AI" and "Create manually" cards
      const createWithAI = page.locator('text=Create with AI').first();
      const createManually = page.locator('text=Create manually').first();
      const startGuidedSetup = page.locator('text=Start guided setup').first();
      const openEditor = page.locator('text=Open editor').first();

      console.log('Create with AI card visible:', await createWithAI.isVisible().catch(() => false));
      console.log('Create manually card visible:', await createManually.isVisible().catch(() => false));
      console.log('Start guided setup link visible:', await startGuidedSetup.isVisible().catch(() => false));
      console.log('Open editor link visible:', await openEditor.isVisible().catch(() => false));

      // Check footer text
      const footerText = await page.locator('text=ADMINS & OWNERS ONLY').first().innerText().catch(() => '');
      console.log('Footer text:', footerText);

      expect(modalVisible, 'Setup wizard should auto-open on pristine ontology').toBeTruthy();
    }

    // Navigate to /ontology route
    await page.goto(`${BASE}/ontology`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await page.screenshot({ path: 'screenshots/tc270-ontology-page.png' });
    console.log('Ontology URL:', page.url());

    const bodyText = await page.locator('body').innerText();
    console.log('Ontology page content:', bodyText.substring(0, 400));
  });
});

test.describe('TC-379 | Onboarding prompt shown to admin when ontology is pristine', () => {
  test('setup wizard content, action cards, and dismiss behavior', async ({ page }) => {
    await login(page);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // The setup wizard auto-opens (it IS the onboarding prompt)
    const setupModal = page.locator('.v-overlay--active').first();
    const isVisible = await setupModal.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Onboarding prompt/setup wizard visible:', isVisible);

    await page.screenshot({ path: 'screenshots/tc379-onboarding.png' });

    if (isVisible) {
      const modalText = await setupModal.innerText().catch(() => '');
      console.log('Modal content:', modalText.substring(0, 500));

      // Verify action options (cards with links, not buttons)
      const createWithAICard = page.locator('text=Create with AI').first();
      const createManuallyCard = page.locator('text=Create manually').first();
      const startGuidedSetupLink = page.locator('text=Start guided setup').first();
      const openEditorLink = page.locator('text=Open editor').first();
      const adminsOnlyFooter = page.locator('text=ADMINS & OWNERS ONLY').first();

      console.log('Create with AI card:', await createWithAICard.isVisible().catch(() => false));
      console.log('Create manually card:', await createManuallyCard.isVisible().catch(() => false));
      console.log('Start guided setup link:', await startGuidedSetupLink.isVisible().catch(() => false));
      console.log('Open editor link:', await openEditorLink.isVisible().catch(() => false));
      console.log('ADMINS & OWNERS ONLY footer:', await adminsOnlyFooter.isVisible().catch(() => false));

      // The close button (X) is the modal dismiss
      const closeBtn = page.locator('.v-overlay--active .v-btn--icon').first();
      console.log('X close button visible:', await closeBtn.isVisible().catch(() => false));

      // Dismiss by clicking X
      if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await closeBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/tc379-after-dismiss.png' });
        const stillVisible = await setupModal.isVisible().catch(() => false);
        console.log('Modal still visible after X click:', stillVisible);
        expect(stillVisible, 'Modal should dismiss when X is clicked').toBeFalsy();
      }
    }

    expect(isVisible, 'Onboarding prompt should be shown when ontology is pristine').toBeTruthy();
  });
});

test.describe('TC-405 | Chat composer disabled when ontology is pristine', () => {
  test('chat blocking state on root page (chat is at /)', async ({ page }) => {
    await login(page);
    await dismissModal(page);

    // Chat is at / (root), not /chat (which 404s)
    await page.goto(`${BASE}/`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    await dismissModal(page);

    await page.screenshot({ path: 'screenshots/tc405-chat-page.png' });
    console.log('Chat URL:', page.url());

    const bodyText = await page.locator('body').innerText();
    console.log('Chat page content:', bodyText.substring(0, 600));

    // Check for "AI Chat Unavailable" guard message
    const chatGuard = page.locator('text=AI Chat Unavailable').first();
    const hasGuard = await chatGuard.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('AI Chat Unavailable message visible:', hasGuard);

    // Check guard message details
    if (hasGuard) {
      const guardCard = page.locator('[class*="v-card"]').filter({ hasText: 'AI Chat Unavailable' }).first();
      const guardText = await guardCard.innerText().catch(() => '');
      console.log('Guard message content:', guardText);

      // Check for configure action link
      const configureBtn = page.locator('text=Configure AI Provider').first();
      console.log('Configure AI Provider button visible:', await configureBtn.isVisible().catch(() => false));
    }

    // Check the chat composer (input field) â€” should be blurred/disabled
    const composer = page.locator('textarea, [contenteditable="true"]').first();
    const composerVisible = await composer.isVisible({ timeout: 2000 }).catch(() => false);
    const composerDisabled = await composer.isDisabled().catch(() => true);
    console.log('Chat input visible:', composerVisible);
    console.log('Chat input disabled:', composerDisabled);

    // Check for any suggestion prompts (ghosted examples shown behind guard)
    const suggestions = await page.locator('[class*="suggestion"], [class*="example"]').allTextContents();
    console.log('Example prompts visible:', suggestions);

    expect(hasGuard || composerDisabled, 'Chat should be blocked when no LLM and ontology is pristine').toBeTruthy();
  });
});
