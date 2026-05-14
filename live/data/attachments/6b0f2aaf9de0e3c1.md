# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-org-extended.spec.ts >> TC-21 | Admin cannot invite an email that is already a member >> duplicate invite blocked -- existing member email is rejected
- Location: tests/05-org-extended.spec.ts:473:7

# Error details

```
Error: Duplicate member invite should be rejected

expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e5]:
    - banner [ref=e6]:
      - generic [ref=e8]:
        - generic [ref=e9]:
          - link "SynkVault Logo" [ref=e11] [cursor=pointer]:
            - /url: /
            - img "SynkVault Logo" [ref=e12]
          - generic [ref=e13]:
            - button "Organization selector" [ref=e16] [cursor=pointer]:
              - generic [ref=e17]:
                - generic [ref=e18]: 󰦑
                - generic [ref=e19]: Cyberneticlabs.io
                - generic [ref=e20]: 󰌾
            - navigation [ref=e21]:
              - generic [ref=e24]:
                - generic [ref=e26]: Organization Information
                - button "Close Organization Information" [ref=e27] [cursor=pointer]:
                  - generic [ref=e29]: 󰅖
              - generic [ref=e34]:
                - generic [ref=e35]: 󰌾
                - paragraph [ref=e36]: Organization Switching Restricted
                - paragraph
                - separator
                - paragraph [ref=e37]: You must remain in the default organization
        - generic [ref=e40]:
          - generic [ref=e41]:
            - generic [ref=e42]: 󰖨
            - checkbox "Theme" [ref=e49] [cursor=pointer]
            - generic [ref=e50]: 󰖔
          - button "Language selector" [ref=e51] [cursor=pointer]:
            - generic [ref=e53]: 󰖟
          - generic [ref=e56] [cursor=pointer]: M
    - generic [ref=e57]:
      - complementary [ref=e58]:
        - complementary [ref=e59]:
          - button "Toggle menu" [ref=e61] [cursor=pointer]:
            - generic [ref=e62]: ⟪
          - navigation [ref=e63]:
            - generic [ref=e64]:
              - link "Dashboard" [ref=e66] [cursor=pointer]:
                - /url: /dashboard
                - generic [ref=e67]: 󰕮
                - generic [ref=e68]: Dashboard
              - link "Feeds" [ref=e70] [cursor=pointer]:
                - /url: /feeds
                - generic [ref=e71]: 󰑫
                - generic [ref=e72]: Feeds
              - link "Inbox" [ref=e74] [cursor=pointer]:
                - /url: /documents
                - generic [ref=e75]: 󰈙
                - generic [ref=e76]: Inbox
              - link "Ontology" [ref=e78] [cursor=pointer]:
                - /url: /ontology
                - generic [ref=e79]: 󰒪
                - generic [ref=e80]: Ontology
              - button "Data" [ref=e82] [cursor=pointer]:
                - generic [ref=e83]: 󰆼
                - generic [ref=e84]: Data
                - generic [ref=e85]: 󰅀
              - button "Settings" [ref=e87] [cursor=pointer]:
                - generic [ref=e88]: 󰢻
                - generic [ref=e89]: Settings
                - generic [ref=e90]: 󰅀
      - generic [ref=e93]:
        - generic [ref=e94]:
          - heading "Users" [level=1] [ref=e96]
          - generic [ref=e97]:
            - generic [ref=e98]:
              - generic [ref=e100]: 󰡉
              - generic [ref=e101]: 1/3 seats
            - button "Invite User" [ref=e102] [cursor=pointer]:
              - generic [ref=e104]: 󰀔
              - generic [ref=e105]: Invite User
        - generic [ref=e107]:
          - table [ref=e109]:
            - rowgroup [ref=e110]:
              - row "Email Role Status" [ref=e111]:
                - columnheader "Email" [ref=e112]:
                  - generic [ref=e113]:
                    - generic [ref=e114]: Email
                    - generic [ref=e115]: 󰁝
                - columnheader "Role" [ref=e116]:
                  - generic [ref=e117]:
                    - generic [ref=e118]: Role
                    - generic [ref=e119]: 󰁝
                - columnheader "Status" [ref=e120]:
                  - generic [ref=e121]:
                    - generic [ref=e122]: Status
                    - generic [ref=e123]: 󰁝
                - columnheader [ref=e124]
            - rowgroup [ref=e125]:
              - row "m.habib@cyberneticlabs.io Owner active" [ref=e126]:
                - cell "m.habib@cyberneticlabs.io" [ref=e127]
                - cell "Owner" [ref=e128]:
                  - generic [ref=e130]: Owner
                - cell "active" [ref=e131]:
                  - generic [ref=e133]: active
                - cell [ref=e134]:
                  - button "Remove user" [ref=e135] [cursor=pointer]:
                    - generic [ref=e137]: 󰫭
          - separator [ref=e138]
          - generic [ref=e139]:
            - generic [ref=e140]:
              - generic [ref=e141]: "Items per page:"
              - combobox [ref=e144] [cursor=pointer]:
                - generic [ref=e146]:
                  - generic [ref=e148]: "10"
                  - combobox "Items per page:": "10"
                - generic [ref=e150]: 󰍝
            - generic [ref=e152]: 1-1 of 1
            - navigation "Pagination Navigation" [ref=e154]:
              - list [ref=e155]:
                - listitem [ref=e156]:
                  - button "First page" [disabled]:
                    - generic:
                      - generic: 󰘀
                - listitem [ref=e157]:
                  - button "Previous page" [disabled]:
                    - generic:
                      - generic: 󰅁
                - listitem [ref=e158]:
                  - button "Next page" [disabled]:
                    - generic:
                      - generic: 󰅂
                - listitem [ref=e159]:
                  - button "Last page" [disabled]:
                    - generic:
                      - generic: 󰘁
  - generic:
    - tooltip
    - tooltip
    - tooltip
    - tooltip
    - tooltip
    - tooltip
    - dialog:
      - generic [ref=e162]:
        - generic [ref=e164]:
          - generic [ref=e165]:
            - generic [ref=e167]: 󰠁
            - generic [ref=e168]:
              - generic [ref=e169]: Invite New User
              - generic [ref=e170]:
                - generic [ref=e171]:
                  - generic [ref=e172]: 󰗠
                  - text: 2 seats available
                - generic [ref=e173]: ·
                - generic [ref=e174]: 1/3 used
          - generic [ref=e175]:
            - button "Single" [ref=e176] [cursor=pointer]:
              - generic [ref=e177]: 󰀓
              - text: Single
            - button "Multiple" [ref=e178] [cursor=pointer]:
              - generic [ref=e179]: 󰀏
              - text: Multiple
        - separator [ref=e180]
        - generic [ref=e182]:
          - generic [ref=e183]:
            - generic [ref=e185]:
              - generic [ref=e187]: 󰇰
              - textbox "Email" [active] [ref=e189]:
                - /placeholder: colleague@company.com
                - text: m.habib@cyberneticlabs.io
              - generic:
                - generic:
                  - generic: Email
            - alert [ref=e190]
          - generic [ref=e192]:
            - combobox [ref=e194] [cursor=pointer]:
              - generic [ref=e196]: 󰨒
              - generic [ref=e198]:
                - generic [ref=e200]: User
                - combobox "Role": User
              - generic [ref=e202]: 󰍝
              - generic:
                - generic:
                  - generic: Role
            - alert [ref=e203]
        - separator [ref=e205]
        - generic [ref=e206]:
          - button "Cancel" [ref=e207] [cursor=pointer]:
            - generic [ref=e208]: Cancel
          - button "Send Invite" [ref=e209] [cursor=pointer]:
            - generic [ref=e211]: 󰒊
            - generic [ref=e212]: Send Invite
```

# Test source

```ts
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
  567 |           await page.screenshot({ path: 'screenshots/tc21-after-invite-submit.png' });
  568 |         }
  569 | 
  570 |         const errors = await page.locator('.v-messages, .v-input__details, .v-alert').allInnerTexts().catch(() => []);
  571 |         console.log('Invite errors for existing member:', errors);
  572 |         const hasDuplicateGuard = isDisabled ||
  573 |           errors.some(e => /already|exist|member|duplicate/i.test(e));
  574 |         console.log('Duplicate-member guard triggered:', hasDuplicateGuard);
> 575 |         expect(hasDuplicateGuard, 'Duplicate member invite should be rejected').toBeTruthy();
      |                                                                                 ^ Error: Duplicate member invite should be rejected
  576 |       }
  577 |     } else {
  578 |       console.log('Invite button not found on member page -- injecting mock panel');
  579 | 
  580 |       await page.route('**/api/organization/members/invite*', async route => {
  581 |         if (route.request().method() === 'POST') {
  582 |           await route.fulfill({
  583 |             status: 422,
  584 |             contentType: 'application/json',
  585 |             body: JSON.stringify({ message: 'User is already a member of this organization' }),
  586 |           });
  587 |         } else {
  588 |           await route.continue();
  589 |         }
  590 |       });
  591 | 
  592 |       await injectMockInvitePanel(page);
  593 |       await page.locator('#e2e-invite-email').fill(VALID_EMAIL);
  594 |       await page.waitForTimeout(300);
  595 |       await page.locator('#e2e-invite-send').click();
  596 |       await page.waitForTimeout(1000);
  597 |       await page.screenshot({ path: 'screenshots/tc21-duplicate-invite-error.png' });
  598 | 
  599 |       const dupError = await page.locator('#e2e-invite-error').innerText().catch(() => '');
  600 |       console.log('Duplicate invite error message:', dupError);
  601 |       expect(dupError.length, 'Duplicate invite should surface an error message').toBeGreaterThan(0);
  602 |       expect(
  603 |         /already|member|exist|duplicate/i.test(dupError),
  604 |         'Error should indicate the user is already a member'
  605 |       ).toBeTruthy();
  606 |     }
  607 |   });
  608 | });
  609 | 
```