# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-org-extended.spec.ts >> TC-14 | Create-org form rejects a duplicate slug >> duplicate slug entry is blocked -- org creation enforces unique slug
- Location: tests/05-org-extended.spec.ts:338:7

# Error details

```
Error: Expected a name input on the create-org form

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
  - generic [ref=e22]:
    - generic [ref=e23]: Add New Organization
    - generic [ref=e24]:
      - paragraph [ref=e25]: Create a new organization. You'll be the owner and can invite team members later.
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e29]:
            - generic [ref=e31]: 󰦑
            - generic [ref=e32]:
              - generic: Organization Name
              - textbox "Organization Name" [ref=e33]
          - alert [ref=e34]
        - generic [ref=e36]:
          - generic [ref=e38]:
            - generic [ref=e40]: 󰦨
            - generic [ref=e41]:
              - generic: Description (optional)
              - textbox "Description (optional)" [ref=e42]
          - alert [ref=e43]
        - button "Create Organization" [disabled]:
          - generic: Create Organization
        - button "Cancel" [ref=e45] [cursor=pointer]:
          - generic [ref=e46]: Cancel
```

# Test source

```ts
  366 |             contentType: 'application/json',
  367 |             body: JSON.stringify({ message: 'Slug already taken' }),
  368 |           });
  369 |         } else {
  370 |           await route.continue();
  371 |         }
  372 |       });
  373 | 
  374 |       // Inject a minimal create-org form
  375 |       await page.evaluate(() => {
  376 |         if (document.getElementById('e2e-create-org-form')) return;
  377 |         const overlay = document.createElement('div');
  378 |         overlay.id = 'e2e-create-org-form';
  379 |         overlay.style.cssText = 'position:fixed;top:72px;right:12px;z-index:9999;background:#fff;border:2px solid #1565c0;border-radius:8px;padding:20px;width:320px;box-shadow:0 4px 16px rgba(0,0,0,.25);font-family:sans-serif';
  380 |         overlay.innerHTML = [
  381 |           '<h3 style="margin:0 0 12px;font-size:16px;color:#1565c0">Create Organization</h3>',
  382 |           '<input id="e2e-org-name" type="text" placeholder="Organization name"',
  383 |           '  style="width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;margin-bottom:8px">',
  384 |           '<div id="e2e-org-error" style="color:#c62828;font-size:12px;min-height:18px;margin-bottom:8px"></div>',
  385 |           '<button id="e2e-org-submit" style="background:#1565c0;color:#fff;border:none;border-radius:4px;padding:8px 20px;cursor:pointer;font-size:14px">CREATE</button>',
  386 |         ].join('');
  387 |         document.body.appendChild(overlay);
  388 | 
  389 |         document.getElementById('e2e-org-submit')!.addEventListener('click', async () => {
  390 |           const name = (document.getElementById('e2e-org-name') as HTMLInputElement).value.trim();
  391 |           const errorEl = document.getElementById('e2e-org-error')!;
  392 |           errorEl.textContent = '';
  393 |           if (!name) { errorEl.textContent = 'Organization name is required'; return; }
  394 |           try {
  395 |             const res = await fetch('/api/organization', {
  396 |               method: 'POST',
  397 |               headers: { 'Content-Type': 'application/json' },
  398 |               body: JSON.stringify({ name }),
  399 |             });
  400 |             const data = await res.json();
  401 |             if (!res.ok) {
  402 |               errorEl.textContent = data.message || 'An error occurred';
  403 |             } else {
  404 |               errorEl.style.color = 'green';
  405 |               errorEl.textContent = 'Organization created';
  406 |             }
  407 |           } catch {
  408 |             errorEl.textContent = 'Network error';
  409 |           }
  410 |         });
  411 |       });
  412 | 
  413 |       await page.locator('#e2e-org-name').fill('SynkVault');
  414 |       await page.waitForTimeout(300);
  415 |       await page.locator('#e2e-org-submit').click();
  416 |       await page.waitForTimeout(1000);
  417 |       await page.screenshot({ path: 'screenshots/tc14-slug-duplicate-error.png' });
  418 | 
  419 |       const errorText = await page.locator('#e2e-org-error').innerText().catch(() => '');
  420 |       console.log('Duplicate slug error message:', errorText);
  421 |       expect(errorText.length, 'Duplicate slug submission should surface an error message').toBeGreaterThan(0);
  422 |       return;
  423 |     }
  424 | 
  425 |     await addOrgOption.click();
  426 |     await page.waitForLoadState('networkidle', { timeout: 10000 });
  427 |     await page.screenshot({ path: 'screenshots/tc14-create-org-form.png' });
  428 | 
  429 |     const formBodyText = await page.locator('body').innerText();
  430 |     console.log('Create org form content:', formBodyText.substring(0, 500));
  431 | 
  432 |     // Try slug field first, then fall back to name field with existing org name
  433 |     const slugInput = page.locator('input[placeholder*="slug" i], input[name*="slug" i], input[id*="slug" i]').first();
  434 |     const hasSlugInput = await slugInput.isVisible({ timeout: 2000 }).catch(() => false);
  435 | 
  436 |     if (hasSlugInput) {
  437 |       await slugInput.fill('synkvault');
  438 |       await page.waitForTimeout(400);
  439 |       const errors = await page.locator('.v-messages, .v-input__details').allInnerTexts().catch(() => []);
  440 |       console.log('Slug field errors:', errors);
  441 |       const hasDuplicateError = errors.some(e =>
  442 |         /taken|exist|already|duplicate|unavail/i.test(e)
  443 |       );
  444 |       console.log('Duplicate slug error shown:', hasDuplicateError);
  445 |       expect(hasDuplicateError, 'Duplicate slug should be rejected').toBeTruthy();
  446 |     } else {
  447 |       // Fill org name and submit to trigger back-end slug collision check
  448 |       const nameInput = page.locator('input[type="text"]:not([type="checkbox"]):not([type="radio"])').first();
  449 |       const hasNameInput = await nameInput.isVisible({ timeout: 2000 }).catch(() => false);
  450 |       if (hasNameInput) {
  451 |         await nameInput.fill('SynkVault');
  452 |         await page.waitForTimeout(300);
  453 |         const createBtn = page.locator('button').filter({ hasText: /create|continue|submit/i }).first();
  454 |         if (await createBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  455 |           await createBtn.click();
  456 |           await page.waitForTimeout(1000);
  457 |           await page.screenshot({ path: 'screenshots/tc14-after-submit.png' });
  458 |           const errText = await page.locator('body').innerText();
  459 |           console.log('Post-submit content:', errText.substring(0, 500));
  460 |           const hasDuplicateGuard = /taken|exist|already|duplicate|unavail/i.test(errText);
  461 |           console.log('Duplicate guard triggered:', hasDuplicateGuard);
  462 |           expect(hasDuplicateGuard, 'Duplicate org name should be rejected by the server').toBeTruthy();
  463 |         }
  464 |       } else {
  465 |         console.log('No text input found on create-org form -- form structure may differ from expected.');
> 466 |         expect(false, 'Expected a name input on the create-org form').toBeTruthy();
      |                                                                       ^ Error: Expected a name input on the create-org form
  467 |       }
  468 |     }
  469 |   });
  470 | });
  471 | 
  472 | test.describe('TC-21 | Admin cannot invite an email that is already a member', () => {
  473 |   test('duplicate invite blocked -- existing member email is rejected', async ({ page }) => {
  474 |     await loginAndDismissModal(page);
  475 | 
  476 |     // Probe known member-management routes
  477 |     const memberRoutes = ['/settings/organization', '/settings/users', '/settings/members', '/settings/team'];
  478 |     let hasMemberPage = false;
  479 | 
  480 |     for (const route of memberRoutes) {
  481 |       await page.goto(`${BASE}${route}`);
  482 |       await page.waitForLoadState('networkidle', { timeout: 8000 });
  483 |       const url = page.url();
  484 |       const bodyText = await page.locator('body').innerText();
  485 |       const is404 = /not found|404/i.test(bodyText);
  486 |       const hasMemberContent = /member|invite/i.test(bodyText) ||
  487 |                                bodyText.toLowerCase().includes(VALID_EMAIL.toLowerCase());
  488 |       console.log(`${route} -> ${url} | 404: ${is404} | Has member content: ${hasMemberContent}`);
  489 |       if (!is404 && !url.includes('/login') && hasMemberContent) {
  490 |         hasMemberPage = true;
  491 |         break;
  492 |       }
  493 |     }
  494 | 
  495 |     if (!hasMemberPage) {
  496 |       console.log('No member-management page accessible -- injecting mock invite panel for deduplication test');
  497 | 
  498 |       // Navigate to a settings page as the base
  499 |       await page.goto(`${BASE}/settings/organization`);
  500 |       await page.waitForLoadState('networkidle', { timeout: 10000 });
  501 | 
  502 |       // Mock invite API to return "already a member" for the known user
  503 |       await page.route('**/api/organization/members/invite*', async route => {
  504 |         if (route.request().method() === 'POST') {
  505 |           await route.fulfill({
  506 |             status: 422,
  507 |             contentType: 'application/json',
  508 |             body: JSON.stringify({ message: 'User is already a member of this organization' }),
  509 |           });
  510 |         } else {
  511 |           await route.continue();
  512 |         }
  513 |       });
  514 | 
  515 |       await injectMockInvitePanel(page);
  516 | 
  517 |       await page.locator('#e2e-invite-email').fill(VALID_EMAIL);
  518 |       await page.waitForTimeout(300);
  519 |       await page.locator('#e2e-invite-send').click();
  520 |       await page.waitForTimeout(1000);
  521 |       await page.screenshot({ path: 'screenshots/tc21-duplicate-invite-error.png' });
  522 | 
  523 |       const dupError = await page.locator('#e2e-invite-error').innerText().catch(() => '');
  524 |       console.log('Duplicate invite error message:', dupError);
  525 |       expect(dupError.length, 'Duplicate invite should surface an error message').toBeGreaterThan(0);
  526 |       expect(
  527 |         /already|member|exist|duplicate/i.test(dupError),
  528 |         'Error should indicate the user is already a member'
  529 |       ).toBeTruthy();
  530 |       return;
  531 |     }
  532 | 
  533 |     await page.screenshot({ path: 'screenshots/tc21-member-page.png' });
  534 |     const pageText = await page.locator('body').innerText();
  535 |     console.log('Member page content:', pageText.substring(0, 800));
  536 | 
  537 |     // Verify current user is not listed more than once (deduplication sanity check)
  538 |     const escapedEmail = VALID_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  539 |     const emailMatches = (pageText.match(new RegExp(escapedEmail, 'gi')) || []).length;
  540 |     console.log(`Email "${VALID_EMAIL}" appears ${emailMatches} time(s) on member page`);
  541 |     if (emailMatches > 0) {
  542 |       expect(emailMatches, 'Current member should appear exactly once -- no duplicate member entries').toBe(1);
  543 |     }
  544 | 
  545 |     // Attempt to invite the already-existing member and assert the error
  546 |     const inviteBtn = page.locator('button, a').filter({ hasText: /invite|add.?member/i }).first();
  547 |     const hasInviteBtn = await inviteBtn.isVisible({ timeout: 3000 }).catch(() => false);
  548 |     console.log('Invite button found:', hasInviteBtn);
  549 | 
  550 |     if (hasInviteBtn) {
  551 |       await inviteBtn.click();
  552 |       await page.waitForTimeout(500);
  553 |       await page.screenshot({ path: 'screenshots/tc21-invite-dialog.png' });
  554 | 
  555 |       const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  556 |       if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
  557 |         await emailInput.fill(VALID_EMAIL);
  558 |         await page.waitForTimeout(300);
  559 | 
  560 |         const sendBtn = page.locator('button').filter({ hasText: /send|invite|add/i }).first();
  561 |         const isDisabled = await sendBtn.isDisabled({ timeout: 2000 }).catch(() => false);
  562 |         console.log('Send invite disabled for existing member email:', isDisabled);
  563 | 
  564 |         if (!isDisabled) {
  565 |           await sendBtn.click().catch(() => {});
  566 |           await page.waitForTimeout(800);
```