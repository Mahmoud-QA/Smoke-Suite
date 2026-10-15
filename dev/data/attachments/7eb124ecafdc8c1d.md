# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 01-auth.spec.ts >> TC-02 | Sign-up form validates all required fields >> CREATE ACCOUNT button disabled on empty form (progressive validation)
- Location: tests/01-auth.spec.ts:16:7

# Error details

```
Error: Submit button should enable when all required fields are filled

expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=e9]:
  - generic [ref=e11]:
    - img "SynkVault Logo" [ref=e13]
    - button "Language selector" [ref=e15] [cursor=pointer]:
      - generic [ref=e17]: 󰖟
  - generic [ref=e23]:
    - generic [ref=e24]: Sign Up
    - generic [ref=e25]:
      - generic [ref=e26]:
        - generic [ref=e28]:
          - generic [ref=e30]: 󰇮
          - textbox "Email" [ref=e32]: test@example.com
          - generic:
            - generic:
              - generic: Email
        - alert [ref=e33]
      - generic [ref=e35]:
        - generic [ref=e37]:
          - generic [ref=e39]:
            - generic [ref=e41]: 󰀄
            - textbox "First Name" [ref=e43]: Test
            - generic:
              - generic:
                - generic: First Name
          - alert [ref=e44]
        - generic [ref=e47]:
          - generic [ref=e49]:
            - generic [ref=e51]: 󰀄
            - textbox "Last Name" [ref=e53]: User
            - generic:
              - generic:
                - generic: Last Name
          - alert [ref=e54]
      - generic [ref=e56]:
        - generic [ref=e58]:
          - generic [ref=e60]: 󰌾
          - textbox "Password" [ref=e62]: TestPass@123
          - generic:
            - generic:
              - generic: Password
        - alert [ref=e63]
      - generic [ref=e65]:
        - generic [ref=e67]:
          - generic [ref=e69]: 󱎚
          - textbox "Confirm Password" [active] [ref=e71]: TestPass@123
          - generic:
            - generic:
              - generic: Confirm Password
        - alert [ref=e72]
      - generic [ref=e76]:
        - generic [ref=e78]:
          - generic [ref=e79]: 󰄱
          - checkbox "I agree to the Terms & Conditions and Privacy Policy" [ref=e80] [cursor=pointer]
        - generic [ref=e82] [cursor=pointer]:
          - text: I agree to the
          - link "Terms & Conditions" [ref=e83]:
            - /url: https://synkvault.net/legal/terms
          - text: and
          - link "Privacy Policy" [ref=e84]:
            - /url: https://synkvault.net/legal/privacy-policy
      - button "Create Account" [disabled]:
        - generic: Create Account
    - generic [ref=e85]:
      - paragraph [ref=e86]: Already have an account?
      - button "Sign In" [ref=e87] [cursor=pointer]:
        - generic [ref=e88]: Sign In
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | const BASE = process.env.BASE_URL || 'https://app.synkvault.net';
  4   | const VALID_EMAIL = process.env.TEST_EMAIL || 'm.habib@cyberneticlabs.io';
  5   | const VALID_PASSWORD = process.env.TEST_PASSWORD || 'SynkVault@123';
  6   | 
  7   | async function navigateToSignUp(page: any) {
  8   |   // /register redirects to login; must click SIGN UP from login page
  9   |   await page.goto(`${BASE}/login`);
  10  |   await page.waitForSelector('button:has-text("SIGN UP")', { timeout: 10000 });
  11  |   await page.getByRole('button', { name: 'SIGN UP' }).click();
  12  |   await page.waitForSelector('button:has-text("CREATE ACCOUNT")', { timeout: 10000 });
  13  | }
  14  | 
  15  | test.describe('TC-02 | Sign-up form validates all required fields', () => {
  16  |   test('CREATE ACCOUNT button disabled on empty form (progressive validation)', async ({ page }) => {
  17  |     await navigateToSignUp(page);
  18  |     await page.screenshot({ path: 'screenshots/tc02-signup-page.png' });
  19  | 
  20  |     const submitBtn = page.getByRole('button', { name: 'CREATE ACCOUNT' });
  21  | 
  22  |     // Validation: button is disabled when form is empty
  23  |     const isDisabledOnEmpty = await submitBtn.isDisabled();
  24  |     console.log('CREATE ACCOUNT disabled on empty form:', isDisabledOnEmpty);
  25  |     expect(isDisabledOnEmpty, 'Submit button should be disabled when form is empty').toBeTruthy();
  26  | 
  27  |     // Fill email only -- button should remain disabled
  28  |     await page.locator('input[type="email"]').first().fill('test@example.com');
  29  |     await page.waitForTimeout(300);
  30  |     const disabledAfterEmailOnly = await submitBtn.isDisabled();
  31  |     console.log('Button disabled after email only:', disabledAfterEmailOnly);
  32  | 
  33  |     // Fill all required fields
  34  |     await page.locator('input[type="text"]').nth(0).fill('Test');        // First Name
  35  |     await page.locator('input[type="text"]').nth(1).fill('User');        // Last Name
  36  |     await page.locator('input[type="password"]').nth(0).fill('TestPass@123'); // Password
  37  |     await page.locator('input[type="password"]').nth(1).fill('TestPass@123'); // Confirm
  38  | 
  39  |     await page.waitForTimeout(400);
  40  |     const isEnabledWhenFilled = await submitBtn.isEnabled();
  41  |     console.log('CREATE ACCOUNT enabled when all fields filled:', isEnabledWhenFilled);
  42  |     await page.screenshot({ path: 'screenshots/tc02-all-filled.png' });
> 43  |     expect(isEnabledWhenFilled, 'Submit button should enable when all required fields are filled').toBeTruthy();
      |                                                                                                    ^ Error: Submit button should enable when all required fields are filled
  44  |   });
  45  | 
  46  |   test('captures all sign-up form fields', async ({ page }) => {
  47  |     await navigateToSignUp(page);
  48  | 
  49  |     const inputs = await page.locator('input:not([type="hidden"])').all();
  50  |     const fieldData: Record<string, string>[] = [];
  51  |     for (const input of inputs) {
  52  |       const wrapper = input.locator('..').locator('..');
  53  |       const label = await wrapper.locator('.v-label, label').first().innerText().catch(() => '');
  54  |       fieldData.push({
  55  |         type: (await input.getAttribute('type')) ?? '',
  56  |         placeholder: (await input.getAttribute('placeholder')) ?? label.trim(),
  57  |       });
  58  |     }
  59  |     console.log('Sign-up form fields:', JSON.stringify(fieldData, null, 2));
  60  |     expect(inputs.length, 'Sign-up form should have at least 4 input fields (email, first name, last name, password, confirm)').toBeGreaterThanOrEqual(4);
  61  |   });
  62  | });
  63  | 
  64  | test.describe('TC-04 | Existing user signs in with valid credentials', () => {
  65  |   test('successful sign-in and post-login redirect', async ({ page }) => {
  66  |     await page.goto(`${BASE}/login`);
  67  |     await page.waitForSelector('button:has-text("SIGN IN")', { timeout: 10000 });
  68  |     await page.screenshot({ path: 'screenshots/tc04-login-page.png' });
  69  | 
  70  |     // "Remember me for 1 day" checkbox (Vuetify label text)
  71  |     const rememberMe = page.locator('.v-checkbox, input[type="checkbox"]').first();
  72  |     const hasRememberMe = await rememberMe.isVisible();
  73  |     console.log('Has Remember Me checkbox:', hasRememberMe);
  74  | 
  75  |     // Get label text of checkbox
  76  |     const rememberLabel = await page.locator('text=/remember/i').first().innerText().catch(() => 'not found');
  77  |     console.log('Remember me label text:', rememberLabel);
  78  | 
  79  |     // Fill credentials
  80  |     await page.locator('input[type="email"]').first().fill(VALID_EMAIL);
  81  |     await page.locator('input[type="password"]').first().fill(VALID_PASSWORD);
  82  | 
  83  |     await page.screenshot({ path: 'screenshots/tc04-filled-form.png' });
  84  |     await page.getByRole('button', { name: 'SIGN IN' }).click();
  85  | 
  86  |     await page.waitForLoadState('networkidle', { timeout: 15000 });
  87  |     await page.screenshot({ path: 'screenshots/tc04-post-login.png' });
  88  | 
  89  |     const currentUrl = page.url();
  90  |     console.log('Post-login URL:', currentUrl);
  91  |     console.log('Page title:', await page.title());
  92  | 
  93  |     expect(currentUrl).not.toContain('/login');
  94  |     expect(currentUrl).not.toContain('/signin');
  95  |   });
  96  | });
  97  | 
  98  | test.describe('TC-08 | User requests a password reset email', () => {
  99  |   test('forgot password flow shows confirmation', async ({ page }) => {
  100 |     await page.goto(`${BASE}/login`);
  101 |     await page.waitForSelector('button:has-text("SIGN IN")', { timeout: 10000 });
  102 |     await page.screenshot({ path: 'screenshots/tc08-login-page.png' });
  103 | 
  104 |     // "FORGOT PASSWORD?" is a button/text on the login page (not a link)
  105 |     const forgotLink = page.locator('button, a, span').filter({ hasText: /forgot.?password/i }).first();
  106 |     const hasForgotLink = await forgotLink.isVisible();
  107 |     console.log('Has Forgot Password button/link:', hasForgotLink);
  108 |     expect(hasForgotLink, 'Forgot password should be visible on login page').toBeTruthy();
  109 | 
  110 |     await forgotLink.click();
  111 |     await page.screenshot({ path: 'screenshots/tc08-forgot-page.png' });
  112 |     console.log('Forgot password page URL:', page.url());
  113 | 
  114 |     // Fill email
  115 |     await page.locator('input[type="email"], input[name*="email"]').first().fill(VALID_EMAIL);
  116 |     await page.screenshot({ path: 'screenshots/tc08-email-filled.png' });
  117 | 
  118 |     // Submit
  119 |     await page.getByRole('button', { name: /send|submit|reset|continue/i }).first().click();
  120 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  121 | 
  122 |     await page.screenshot({ path: 'screenshots/tc08-post-submit.png' });
  123 | 
  124 |     // Capture confirmation message
  125 |     const bodyText = await page.locator('body').innerText();
  126 |     console.log('Confirmation text visible:', bodyText.substring(0, 500));
  127 | 
  128 |     const hasConfirmation =
  129 |       bodyText.toLowerCase().includes('email') ||
  130 |       bodyText.toLowerCase().includes('sent') ||
  131 |       bodyText.toLowerCase().includes('check') ||
  132 |       bodyText.toLowerCase().includes('reset');
  133 |     expect(hasConfirmation, 'Should show some confirmation after password reset request').toBeTruthy();
  134 |   });
  135 | });
  136 | 
  137 | test.describe('TC-01 | New user registers successfully', () => {
  138 |   test('registration form submits and shows confirmation when mocked API returns success', async ({ page }) => {
  139 |     const timestamp = Date.now();
  140 |     const testEmail = `test.e2e.${timestamp}@example.com`;
  141 |     let registrationApiCalled = false;
  142 | 
  143 |     await page.goto(`${BASE}/login`);
```