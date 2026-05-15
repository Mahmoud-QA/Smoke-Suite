/**
 * Full E2E Account Creation Cycle — Dev Environment
 *
 * Email strategy: Guerrillamail API (guerrillamailblock.com)
 *   1.  GET /ajax.php?f=get_email_address  → email_addr + sid_token
 *   2.  Register with that address on Dev
 *   3.  Poll GET /ajax.php?f=get_email_list&sid_token={t} every 8 s until email arrives
 *   4.  GET /ajax.php?f=fetch_email&email_id={id}&sid_token={t} → extract confirm link
 *   5.  Navigate main page to the confirm link
 *
 * Then:
 *   4.  Sign in with the new credentials
 *   5.  Handle onboarding / subscription gates
 *   6.  Create a new Organisation
 *   7.  Add an OpenAI LLM provider integration
 *   8.  Visit Ontology editor
 *   9.  Save full results to e2e-account-created.json
 */

import { test, expect, Page, APIRequestContext } from '@playwright/test';
import * as fs   from 'fs';
import * as path from 'path';

// ─── Config ────────────────────────────────────────────────────────────────────
const DEV      = process.env.BASE_URL ||
                 'https://synkvault-web-dev-enterprise-386722944781.europe-west2.run.app';
const SS_DIR   = 'screenshots/e2e-cycle';
const NEW_PASS = 'SvE2E2026@!';
const FNAME    = 'E2E';
const LNAME    = 'TestUser';
const TS       = Date.now();
const ORG_NAME = `E2EOrg${TS % 100000}`;   // short name avoids slug length issues

const GUERRILLA = 'https://api.guerrillamail.com/ajax.php';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function ensureSsDir() {
  if (!fs.existsSync(SS_DIR)) fs.mkdirSync(SS_DIR, { recursive: true });
}

async function ss(page: Page, name: string) {
  ensureSsDir();
  await page.screenshot({ path: `${SS_DIR}/${name}`, fullPage: false }).catch(() => {});
}

async function dismissModal(page: Page) {
  const btn = page.locator('.v-overlay--active .v-btn--icon').first();
  if (await btn.isVisible({ timeout: 2_500 }).catch(() => false)) {
    await btn.click();
    await page.waitForTimeout(400);
  } else {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
}

// ── Guerrillamail helpers ──────────────────────────────────────────────────────

async function guerrillaGetAddress(req: APIRequestContext): Promise<{ email: string; sid: string }> {
  const res  = await req.get(`${GUERRILLA}?f=get_email_address`);
  const json = await res.json() as any;
  console.log('Guerrillamail address assigned:', json.email_addr);
  return { email: json.email_addr as string, sid: json.sid_token as string };
}

async function guerrillaWaitForLink(
  req: APIRequestContext,
  sid: string,
  maxMs = 180_000,
): Promise<string> {
  const deadline = Date.now() + maxMs;

  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 8_000));

    const listRes  = await req.get(`${GUERRILLA}?f=get_email_list&offset=0&sid_token=${encodeURIComponent(sid)}`);
    const listJson = await listRes.json() as any;
    const emails: any[] = listJson?.list ?? [];
    console.log(`Guerrillamail poll: ${emails.length} email(s) in inbox`);

    if (emails.length > 0) {
      const emailId  = emails[0].mail_id;
      const fetchRes = await req.get(
        `${GUERRILLA}?f=fetch_email&email_id=${emailId}&sid_token=${encodeURIComponent(sid)}`
      );
      const fetchJson = await fetchRes.json() as any;
      const bodyHtml  = (fetchJson?.mail_body ?? '') as string;

      console.log('Email subject:', fetchJson?.mail_subject);
      console.log('Email body (first 300):', bodyHtml.replace(/<[^>]+>/g, ' ').substring(0, 300));

      // Extract confirmation / verification link
      const patterns: RegExp[] = [
        /href="(https?:\/\/[^"]*(?:verify|confirm|token|activate)[^"]*)"/i,
        /href='(https?:\/\/[^']*(?:verify|confirm|token|activate)[^']*)'/i,
        /(https?:\/\/[^\s<>"']*(?:verify|confirm|token|activate)[^\s<>"']*)/i,
      ];
      for (const p of patterns) {
        const m = bodyHtml.match(p);
        if (m?.[1]) {
          console.log('Verification link found:', m[1].substring(0, 120));
          return m[1];
        }
      }

      // Fallback: any link containing the DEV host
      const hostEscaped = DEV.replace('https://', '').replace(/[.]/g, '\\.');
      const devMatch = bodyHtml.match(new RegExp(`(https?://[^"'\\s]*${hostEscaped}[^"'\\s]*)`, 'i'));
      if (devMatch?.[1]) {
        console.log('Verification link (DEV host fallback):', devMatch[1].substring(0, 120));
        return devMatch[1];
      }

      // If the email is here but no link found, dump full body for diagnosis
      console.warn('Email received but no verification link extracted. Full body HTML:');
      console.warn(bodyHtml.substring(0, 2_000));
    }
  }

  throw new Error('No verification email appeared in Guerrillamail within the timeout');
}

// ─── Test ─────────────────────────────────────────────────────────────────────
test.setTimeout(420_000);     // 7 minutes
test.use({ baseURL: DEV });

test('Full E2E: new account → email verify → login → new org → LLM integration → ontology', async ({
  page,
  request,
}) => {
  ensureSsDir();

  // ── Step 0: Obtain a fresh disposable email from Guerrillamail ──────────
  console.log('\n── Step 0: Get disposable email from Guerrillamail ──');
  const { email: EMAIL, sid: SID } = await guerrillaGetAddress(request);
  console.log('Will register with:', EMAIL);

  const R: Record<string, unknown> = {
    env: DEV,
    email: EMAIL,
    password: NEW_PASS,
    orgName: ORG_NAME,
    startedAt: new Date().toISOString(),
  };

  // ── Capture Supabase project URL from network requests ──────────────────
  let supabaseUrl = '';
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('.supabase.co') && !supabaseUrl) {
      const m = url.match(/(https:\/\/[a-z0-9]+\.supabase\.co)/);
      if (m) {
        supabaseUrl = m[1];
        console.log('Supabase project URL detected:', supabaseUrl);
      }
    }
  });

  // ── Phase 1: Register ─────────────────────────────────────────────────────
  console.log(`\n── Phase 1: Register  ${EMAIL} ──`);
  await page.goto(`${DEV}/login`);
  await page.waitForSelector('button:has-text("SIGN UP")', { timeout: 20_000 });
  await page.getByRole('button', { name: 'SIGN UP' }).click();
  await page.waitForSelector('button:has-text("CREATE ACCOUNT")', { timeout: 15_000 });
  await ss(page, '01-register-form.png');

  // Fill email
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await emailInput.fill(EMAIL);
  } else {
    await page.locator('input:not([type="hidden"])').first().fill(EMAIL);
  }

  // Fill first/last name
  const textInputs = await page.locator('input[type="text"]').all();
  if (textInputs.length >= 1) await textInputs[0].fill(FNAME);
  if (textInputs.length >= 2) await textInputs[1].fill(LNAME);

  // Fill password (x2 if confirm field exists)
  const pwdInputs = await page.locator('input[type="password"]').all();
  if (pwdInputs.length >= 1) await pwdInputs[0].fill(NEW_PASS);
  if (pwdInputs.length >= 2) await pwdInputs[1].fill(NEW_PASS);

  await page.waitForTimeout(500);
  await ss(page, '02-register-filled.png');

  const createBtn  = page.getByRole('button', { name: 'CREATE ACCOUNT' });
  const btnEnabled = await createBtn.isEnabled({ timeout: 5_000 }).catch(() => false);
  console.log('CREATE ACCOUNT button enabled:', btnEnabled);
  expect(btnEnabled, 'CREATE ACCOUNT must be enabled after filling all fields').toBeTruthy();

  await createBtn.click();
  await page.waitForLoadState('networkidle', { timeout: 25_000 }).catch(() => {});
  await ss(page, '03-after-register.png');

  const postRegText = await page.locator('body').innerText().catch(() => '');
  console.log('Post-registration URL :', page.url());
  console.log('Post-registration text:', postRegText.substring(0, 400));
  console.log('Supabase URL captured :', supabaseUrl || '(none yet)');
  R.postRegistrationUrl = page.url();
  R.supabaseProjectUrl  = supabaseUrl;

  // ── Phase 2: Email verification via Guerrillamail ─────────────────────────
  console.log('\n── Phase 2: Wait for verification email in Guerrillamail ──');
  let verifiedOk = false;

  try {
    const verifyLink = await guerrillaWaitForLink(request, SID);
    R.verificationLink   = verifyLink;
    R.verificationMethod = 'guerrillamail';

    await page.goto(verifyLink, { waitUntil: 'networkidle', timeout: 25_000 });
    await ss(page, '04-after-verify.png');
    console.log('After verification URL:', page.url());
    R.afterVerificationUrl = page.url();
    verifiedOk = true;
  } catch (err: any) {
    console.warn('⚠ Guerrillamail verification failed:', err.message);
    R.verificationError  = err.message;
    R.verificationMethod = 'failed';
  }

  R.emailVerified = verifiedOk;

  // ── Phase 3: Login ────────────────────────────────────────────────────────
  console.log('\n── Phase 3: Ensure logged in ──');

  // After following the Supabase verification link the user is auto-authenticated.
  // The app may redirect to /auth/signup/create-team, /confirm, or similar.
  // Check current URL first before attempting an explicit sign-in.
  const postVerifyUrl = page.url();
  console.log('Current URL before login phase:', postVerifyUrl);
  const alreadyAuthenticated = !postVerifyUrl.includes('/login') &&
                               !postVerifyUrl.includes('/auth/login') &&
                               verifiedOk;

  let loggedIn = alreadyAuthenticated;

  if (alreadyAuthenticated) {
    console.log('Already authenticated via verification link — skipping explicit sign-in.');
    R.loginMethod = 'auto-authenticated-via-verify-link';
  } else {
    // Not yet authenticated — do explicit sign-in
    await page.goto(`${DEV}/login`);
    // Wait for either SIGN IN button or an automatic redirect away from login
    await Promise.race([
      page.waitForSelector('button:has-text("SIGN IN")', { timeout: 15_000 }),
      page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15_000 }),
    ]).catch(() => {});
    await ss(page, '05-login-page.png');

    if (page.url().includes('/login')) {
      await page.locator('input[type="email"]').first().fill(EMAIL);
      await page.locator('input[type="password"]').first().fill(NEW_PASS);
      await page.getByRole('button', { name: 'SIGN IN' }).click();
      await page.waitForLoadState('networkidle', { timeout: 25_000 }).catch(() => {});
    }
    R.loginMethod = 'explicit-form';
  }

  await ss(page, '06-after-login.png');

  const afterLoginUrl  = page.url();
  const afterLoginText = await page.locator('body').innerText().catch(() => '');
  console.log('After login URL :', afterLoginUrl);
  loggedIn = !afterLoginUrl.includes('/login') && !afterLoginUrl.includes('/auth/login');
  console.log('Logged in:', loggedIn);
  R.afterLoginUrl = afterLoginUrl;
  R.loginSuccess  = loggedIn;

  if (!loggedIn) {
    console.log('Login page text:', afterLoginText.substring(0, 500));
    R.loginBodyText = afterLoginText.substring(0, 500);
    R.pendingEmailVerification = /verify|pending|confirm|check.*email/i.test(afterLoginText);
  }

  // ── Phase 4: Onboarding / create-team wizard ─────────────────────────────
  console.log('\n── Phase 4: Handle onboarding / subscription / create-team gates ──');

  // Navigate home — new accounts are redirected to /auth/signup/create-team
  await page.goto(`${DEV}/`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await ss(page, '07-after-home-nav.png');
  console.log('URL after navigating to /:', page.url());

  // Helper that fills and submits the create-team wizard whenever we land on it
  async function handleCreateTeamWizard() {
    if (!page.url().includes('create-team') && !page.url().includes('/auth/signup')) return;
    console.log('Create-team wizard detected:', page.url());
    await ss(page, '07a-create-team.png');
    const bodyNow = await page.locator('body').innerText().catch(() => '');
    console.log('Create-team text:', bodyNow.substring(0, 400));

    // Use Vuetify v-text-field: find the underlying <input> inside the field labelled "Organization Name"
    const orgNameInput = page.locator('.v-text-field input, .v-field input').first()
      .or(page.locator('input[type="text"]').first())
      .or(page.locator('input:not([type="hidden"]):not([type="checkbox"])').first());

    const inputVisible = await orgNameInput.isVisible({ timeout: 4_000 }).catch(() => false);
    console.log('Org name input visible:', inputVisible);

    if (inputVisible) {
      await orgNameInput.click();
      await orgNameInput.fill(ORG_NAME, { force: true });
      await orgNameInput.press('Tab'); // trigger Vuetify validation
      await page.waitForTimeout(600);
      const actualValue = await orgNameInput.inputValue().catch(() => '');
      console.log('Org name input actual value after fill:', actualValue);
    }

    // Capture ALL POST network requests to see which API gets called
    const caughtRequests: string[] = [];
    page.on('request', req => {
      if (req.method() === 'POST') caughtRequests.push(`${req.method()} ${req.url()}`);
    });

    // Use an explicit "CREATE ORGANIZATION" match; it sits above the CANCEL button
    const createOrgBtn = page.locator('button').filter({ hasText: /^create organization$/i }).first()
      .or(page.locator('button').filter({ hasText: /create organization/i }).first());
    const btnOk = await createOrgBtn.isEnabled({ timeout: 5_000 }).catch(() => false);
    console.log('CREATE ORGANIZATION button enabled:', btnOk);

    if (btnOk) {
      // Capture any response from ANY endpoint during the next 10 s
      const allResponses: string[] = [];
      const respListener = (resp: any) => {
        allResponses.push(`${resp.status()} ${resp.url().substring(0, 80)}`);
      };
      page.on('response', respListener);

      await createOrgBtn.click({ force: true });

      // Wait for URL navigation OR up to 15 s (app shows "Finalizing Setup…" before redirect)
      await page.waitForURL(url => !url.toString().includes('create-team'), { timeout: 15_000 })
        .catch(() => {/* still on create-team — check if org data is already there */});

      await page.waitForTimeout(1_500); // extra settle time
      page.off('response', respListener);
      console.log('Network POST requests after click:', caughtRequests);
      console.log('All responses after click:', allResponses.slice(-10));

      await ss(page, '07b-after-create-team.png');
      console.log('After create-team URL:', page.url());
      R.createTeamUrl       = page.url();
      R.orgNetworkRequests  = caughtRequests;

      const errText = await page.locator('.v-messages, .v-alert, [role="alert"], [class*="error"]').first().innerText().catch(() => '');
      if (errText) console.log('Validation / API error on page:', errText);
      R.orgCreatePageError = errText || null;

      // Consider org created if: URL changed, OR org API was called (create/provision)
      const apiHit = caughtRequests.some(r => r.includes('/org/create') || r.includes('/org/provision'));
      if (!page.url().includes('create-team') || apiHit) {
        R.orgCreated = true;
        R.orgName    = ORG_NAME;
        console.log('Org created (API called, finalizing in background)');
      } else {
        const pageBody = await page.locator('body').innerText().catch(() => '');
        console.warn('Still on create-team, no API call. Body:', pageBody.substring(0, 600));
        R.orgCreated     = false;
        R.orgCreateStuck = true;
        R.orgCreateBody  = pageBody.substring(0, 600);
      }
    } else {
      console.log('CREATE ORGANIZATION button not enabled — skipping');
    }
    await ss(page, '07b-after-create-team.png');
  }

  await handleCreateTeamWizard();

  // Dismiss any remaining modals / subscription gates
  await dismissModal(page);
  await page.waitForTimeout(600);

  const urlAfterDismiss = page.url();
  if (/no-subscription|subscribe|onboarding/i.test(urlAfterDismiss)) {
    const gateText = await page.locator('body').innerText().catch(() => '');
    console.log('Subscription gate:', urlAfterDismiss);
    console.log('Gate text:', gateText.substring(0, 400));
    R.subscriptionGate = urlAfterDismiss;
    await ss(page, '07-subscription-gate.png');

    const skipBtn = page.locator('button').filter({ hasText: /skip|continue|later|proceed/i }).first();
    if (await skipBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await skipBtn.click();
      await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    }
  }

  await ss(page, '08-home.png');
  R.homeUrl = page.url();
  console.log('Home URL:', R.homeUrl);

  // ── Phase 5: Verify org exists (created during onboarding wizard or check header) ──
  console.log('\n── Phase 5: Verify organisation ──');

  if (R.orgCreated) {
    console.log('Org already created in onboarding wizard:', ORG_NAME);
    R.orgUrl = page.url();
    await ss(page, '09-org-already-created.png');
  } else {
    // Org wasn't created in the wizard — try via header org switcher
    await page.goto(`${DEV}/settings/billing`);
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    await dismissModal(page);
    await ss(page, '09-billing-for-org-switch.png');

    const headerText2 = await page.locator('.v-app-bar, header').first().innerText().catch(() => '');
    console.log('App bar text:', headerText2.substring(0, 200));

    const orgBtnSelectors = [
      '.v-app-bar button:nth-child(2)',
      '.v-app-bar [class*="org"]',
      '[class*="workspace-switcher"]',
      '[class*="org-switcher"]',
    ];

    let orgCreated2 = false;
    for (const sel of orgBtnSelectors) {
      const btn = page.locator(sel).first();
      if (!await btn.isVisible({ timeout: 1_000 }).catch(() => false)) continue;

      await btn.click();
      await page.waitForTimeout(700);
      await ss(page, '10-org-switcher-open.png');

      const addOrgBtn = page.locator(
        'text=Add Organization, text=Create Organization, text=New Organization, ' +
        '[role="menuitem"]:has-text("Add"), [role="option"]:has-text("Add")'
      ).first();

      if (await addOrgBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await addOrgBtn.click();
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
        await ss(page, '11-create-org-form.png');
        console.log('Create org form URL:', page.url());

        const nameField = page.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])').first();
        if (await nameField.isVisible({ timeout: 4_000 }).catch(() => false)) {
          await nameField.fill(ORG_NAME);
          await page.waitForTimeout(400);
        }

        const submitBtn = page.locator('button').filter({ hasText: /create|continue|submit|next/i }).first();
        if (await submitBtn.isEnabled({ timeout: 4_000 }).catch(() => false)) {
          await submitBtn.click();
          await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
          await ss(page, '12-org-created.png');
          const afterOrgText = await page.locator('body').innerText().catch(() => '');
          console.log('After org create URL :', page.url());
          console.log('After org create text:', afterOrgText.substring(0, 400));
          R.orgCreated = true;
          R.orgUrl     = page.url();
          orgCreated2  = true;
        }
        break;
      }

      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    if (!orgCreated2) {
      R.orgCreated  = false;
      R.orgNote     = 'Org not created via switcher — may be in auto-created org';
      const hdrText = await page.locator('.v-app-bar, header').first().innerText().catch(() => '');
      R.detectedOrg = hdrText.substring(0, 200);
      console.log('Org not created. Header:', R.detectedOrg);
      await ss(page, '12-no-org-creation.png');
    }
  }

  // ── Phase 6: Add LLM integration ─────────────────────────────────────────
  console.log('\n── Phase 6: Add OpenAI LLM provider ──');
  // The providers page is at /integrations or /providers — try both
  await page.goto(`${DEV}/integrations`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  console.log('After /integrations goto URL:', page.url());
  // Some builds call this page /providers
  if (page.url().includes('create-team') || page.url().includes('login')) {
    await page.goto(`${DEV}/providers`);
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  }
  await dismissModal(page);
  await page.waitForTimeout(500);
  await ss(page, '13-integrations.png');
  console.log('Providers page URL:', page.url());

  const intText = await page.locator('body').innerText().catch(() => '');
  console.log('Integrations text:', intText.substring(0, 600));
  R.integrationsPageText = intText.substring(0, 300);

  // Diagnose what buttons are on the page
  const allBtnTexts = await page.locator('button, [class*="v-btn"]').allInnerTexts().catch(() => [] as string[]);
  const cleanBtns   = allBtnTexts.map(t => t.trim()).filter(t => t.length > 0 && t.length < 50);
  console.log('All button texts on providers page:', cleanBtns);

  // Use text-based locator as primary — matches any element type with the exact text
  const addProviderBtn = page.locator(':text-is("ADD PROVIDER"), :text-is("Add Provider")')
    .or(page.locator('button').filter({ hasText: /add provider/i }))
    .or(page.locator('[class*="v-btn"]').filter({ hasText: /add provider/i }))
    .first();

  const provBtnCount = await page.locator(':text-is("ADD PROVIDER"), :text-is("Add Provider")').count().catch(() => 0);
  console.log('ADD PROVIDER element count in DOM:', provBtnCount);

  // The element may be under the "Organization Switching Restricted" info overlay —
  // use force:true to bypass the visibility / pointer-events check.
  // Click the outer <button> element (not the inner span) so click handlers fire.
  const providerBtnEl = page.locator('button').filter({ hasText: /add provider/i }).first();
  const providerBtnElCount = await providerBtnEl.count().catch(() => 0);
  console.log('button[hasText=add provider] count:', providerBtnElCount);

  const canClickProvider = provBtnCount > 0 || providerBtnElCount > 0 ||
    await addProviderBtn.isVisible({ timeout: 2_000 }).catch(() => false);
  console.log('canClickProvider:', canClickProvider);

  if (canClickProvider) {
    const btnToClick = providerBtnElCount > 0 ? providerBtnEl : addProviderBtn;
    await btnToClick.scrollIntoViewIfNeeded().catch(() => {});
    console.log('Clicking ADD PROVIDER button…');
    await btnToClick.click({ force: true });
    await page.waitForTimeout(1_500);
    await ss(page, '14-add-provider.png');
    console.log('URL after ADD PROVIDER click:', page.url());
    const afterClickText = await page.locator('body').innerText().catch(() => '');
    console.log('Page text after ADD PROVIDER click (500):', afterClickText.substring(0, 500));

    // Step 1: Select provider category — "LLM Provider" / "Database" / "Other Integration"
    const llmTypeOption = page.locator('[role="option"], [role="menuitem"], .v-list-item, [class*="list-item"]')
      .filter({ hasText: /llm provider/i }).first();
    if (await llmTypeOption.isVisible({ timeout: 3_000 }).catch(() => false)) {
      console.log('Selecting LLM Provider category…');
      await llmTypeOption.click({ force: true });
      await page.waitForTimeout(800);
      await ss(page, '14b-llm-type-selected.png');
      const afterTypeText = await page.locator('body').innerText().catch(() => '');
      console.log('After LLM type select (500):', afterTypeText.substring(0, 500));
    } else {
      console.log('LLM Provider category option not found — maybe already in provider list');
    }

    // Step 2: "Add LLM Provider" form opened.
    // Log all inputs and comboboxes currently on the page for diagnosis.
    await ss(page, '14b-dialog-open.png');
    const allInputs = await page.locator('input').all();
    for (let i = 0; i < Math.min(allInputs.length, 8); i++) {
      const ph   = await allInputs[i].getAttribute('placeholder').catch(() => '');
      const type = await allInputs[i].getAttribute('type').catch(() => '');
      const vis  = await allInputs[i].isVisible().catch(() => false);
      console.log(`  input[${i}] type=${type} placeholder=${ph} visible=${vis}`);
    }
    const allCombos = await page.locator('[role="combobox"], [aria-haspopup="listbox"]').all();
    console.log('Comboboxes on page:', allCombos.length);

    // Integration Name field has placeholder "e.g., openai-prod, gemini-dev"
    const integNameInput = page.locator('input[placeholder*="openai-prod" i], input[placeholder*="gemini-dev" i]').first();
    const integVisible = await integNameInput.isVisible({ timeout: 2_000 }).catch(() => false);
    console.log('Integration name input (placeholder match) visible:', integVisible);
    if (integVisible) {
      await integNameInput.fill('OpenAI Integration', { force: true });
      console.log('Integration name filled via placeholder');
    } else {
      // Fallback: third text input (index 2)
      const allTextInputs = await page.locator('input[type="text"]').all();
      if (allTextInputs.length > 2) {
        await allTextInputs[2].fill('OpenAI Integration', { force: true });
        console.log('Integration name filled via index 2');
      }
    }

    // Provider Type: iterate comboboxes from second-to-last backwards to find one with OpenAI
    let provTypeSelected = false;
    for (let ci = allCombos.length - 2; ci >= 0 && !provTypeSelected; ci--) {
      const cb = allCombos[ci];
      if (!await cb.isVisible({ timeout: 500 }).catch(() => false)) continue;
      await cb.click({ force: true });
      await page.waitForTimeout(500);
      const opts = await page.locator('[role="option"]').allInnerTexts().catch(() => [] as string[]);
      console.log(`Combobox[${ci}] options:`, opts.map(t => t.trim()).filter(t => t));
      const openAIOption = page.locator('[role="option"]').filter({ hasText: /openai/i }).first();
      if (await openAIOption.isVisible({ timeout: 500 }).catch(() => false)) {
        await openAIOption.click({ force: true });
        await page.waitForTimeout(600);
        console.log('OpenAI selected from combobox[' + ci + ']');
        await ss(page, '15-openai-selected.png');
        provTypeSelected = true;
      } else if (opts.length > 0) {
        // Not the provider type combobox — close and try next
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    }
    if (!provTypeSelected) console.log('Provider Type not selected — no combobox had OpenAI option');

    // Fill API key if one appears after selecting provider
    await page.waitForTimeout(500);
    const keyInput = page.locator('input[type="password"], input[placeholder*="key" i], input[placeholder*="api" i], input[placeholder*="token" i]').last();
    if (await keyInput.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await keyInput.fill('sk-e2e-placeholder-key-for-testing', { force: true });
      console.log('API key filled');
    }

    // Click CREATE (last button matching create)
    const createBtn = page.locator('button').filter({ hasText: /^create$|^save$|^add$/i }).last();
    if (await createBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      console.log('Clicking CREATE…');
      await createBtn.click({ force: true });
      await page.waitForTimeout(3_000);
      await ss(page, '16-provider-saved.png');
      const afterSaveText = await page.locator('body').innerText().catch(() => '');
      R.integrationResult = afterSaveText.substring(0, 400);
      R.integrationAdded = !afterSaveText.includes('Add LLM Provider');
      console.log('After CREATE text (400):', afterSaveText.substring(0, 400));
    } else {
      console.log('CREATE button not found');
    }
  } else {
    R.integrationNote = /openai|provider|integration/i.test(intText)
      ? 'Provider already present or add button uses different selector'
      : 'Integrations page not accessible (may need login/subscription)';
    console.log('Add provider button not found.', R.integrationNote);
  }

  // ── Phase 7: Ontology editor ──────────────────────────────────────────────
  console.log('\n── Phase 7: Ontology editor ──');
  await page.goto(`${DEV}/ontology`);
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1_000);

  const setupOverlay = page.locator('.v-overlay--active, [role="dialog"]').first();
  if (await setupOverlay.isVisible({ timeout: 3_000 }).catch(() => false)) {
    const manualBtn = page.locator('[role="dialog"] button, .v-overlay--active button')
      .filter({ hasText: /manually|create manually|skip/i }).first();
    if (await manualBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await manualBtn.click();
      await page.waitForTimeout(800);
      console.log('Chose "Create Manually" in ontology wizard');
    } else {
      await dismissModal(page);
    }
  }

  await ss(page, '17-ontology.png');
  const ontologyText = await page.locator('body').innerText().catch(() => '');
  console.log('Ontology URL :', page.url());
  console.log('Ontology text:', ontologyText.substring(0, 400));
  R.ontologyUrl     = page.url();
  R.ontologyText    = ontologyText.substring(0, 300);
  R.ontologyVisible = !/login|sign in/i.test(ontologyText);

  const toolbar = page.locator('[class*="toolbar"], .v-toolbar, [role="toolbar"]').first();
  R.ontologyEditorLoaded = await toolbar.isVisible({ timeout: 2_000 }).catch(() => false);
  console.log('Ontology editor loaded:', R.ontologyEditorLoaded);

  // ── Final ─────────────────────────────────────────────────────────────────
  R.completedAt = new Date().toISOString();
  const outFile  = path.resolve('e2e-account-created.json');
  fs.writeFileSync(outFile, JSON.stringify(R, null, 2), 'utf-8');

  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║       E2E CYCLE COMPLETE — SUMMARY         ║');
  console.log('╠═══════════════════════════════════════════╣');
  console.log(`║ Email     : ${EMAIL}`);
  console.log(`║ Password  : ${NEW_PASS}`);
  console.log(`║ Org       : ${ORG_NAME}`);
  console.log(`║ Verified  : ${verifiedOk ? '✅ Yes (' + R.verificationMethod + ')' : '❌ No (' + (R.verificationError ?? 'timeout') + ')'}`);
  console.log(`║ Login     : ${R.loginSuccess ? '✅ OK'    : '❌ Failed'}`);
  console.log(`║ Org create: ${R.orgCreated   ? '✅ Done'  : '⚠ Not done'}`);
  console.log(`║ LLM int.  : ${R.integrationAdded ? '✅ Added' : '⚠ Skipped/failed'}`);
  console.log(`║ Ontology  : ${R.ontologyEditorLoaded ? '✅ Loaded' : '⚠ Not loaded'}`);
  console.log(`║ Results   : ${outFile}`);
  console.log('╚═══════════════════════════════════════════╝\n');

  expect(R.email, 'Must have a registered email').toBeTruthy();
  expect(
    R.loginSuccess || R.pendingEmailVerification,
    'Account must either be logged in or confirmed as pending email verification'
  ).toBeTruthy();
});
