# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-org-extended.spec.ts >> TC-21 | Admin cannot invite an email that is already a member >> duplicate invite blocked -- existing member email is rejected
- Location: tests/05-org-extended.spec.ts:487:7

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
                - generic [ref=e19]: Tqase
                - generic [ref=e20]: 󰅀
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
              - button "Ontology" [ref=e78] [cursor=pointer]:
                - generic [ref=e79]: 󰒪
                - generic [ref=e80]: Ontology
                - generic [ref=e81]: 󰅀
              - button "Data" [ref=e83] [cursor=pointer]:
                - generic [ref=e84]: 󰆼
                - generic [ref=e85]: Data
                - generic [ref=e86]: 󰅀
              - button "Settings" [ref=e88] [cursor=pointer]:
                - generic [ref=e89]: 󰢻
                - generic [ref=e90]: Settings
                - generic [ref=e91]: 󰅀
      - generic [ref=e94]:
        - generic [ref=e95]:
          - heading "Users" [level=1] [ref=e97]
          - button "Invite User" [ref=e99] [cursor=pointer]:
            - generic [ref=e101]: 󰀔
            - generic [ref=e102]: Invite User
        - generic [ref=e104]:
          - table [ref=e106]:
            - rowgroup [ref=e107]:
              - row "Email Role Status" [ref=e108]:
                - columnheader "Email" [ref=e109]:
                  - generic [ref=e110]:
                    - generic [ref=e111]: Email
                    - generic [ref=e112]: 󰁝
                - columnheader "Role" [ref=e113]:
                  - generic [ref=e114]:
                    - generic [ref=e115]: Role
                    - generic [ref=e116]: 󰁝
                - columnheader "Status" [ref=e117]:
                  - generic [ref=e118]:
                    - generic [ref=e119]: Status
                    - generic [ref=e120]: 󰁝
                - columnheader [ref=e121]
            - rowgroup [ref=e122]:
              - row "No data available" [ref=e123]:
                - cell "No data available" [ref=e124]
          - separator [ref=e125]
          - generic [ref=e126]:
            - generic [ref=e127]:
              - generic [ref=e128]: "Items per page:"
              - combobox [ref=e131] [cursor=pointer]:
                - generic [ref=e133]:
                  - generic [ref=e135]: "10"
                  - combobox "Items per page:": "10"
                - generic [ref=e137]: 󰍝
            - generic [ref=e139]: 0-0 of 0
            - navigation "Pagination Navigation" [ref=e141]:
              - list [ref=e142]:
                - listitem [ref=e143]:
                  - button "First page" [disabled]:
                    - generic:
                      - generic: 󰘀
                - listitem [ref=e144]:
                  - button "Previous page" [disabled]:
                    - generic:
                      - generic: 󰅁
                - listitem [ref=e145]:
                  - button "Next page" [disabled]:
                    - generic:
                      - generic: 󰅂
                - listitem [ref=e146]:
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
      - generic [ref=e149]:
        - generic [ref=e151]:
          - generic [ref=e152]:
            - generic [ref=e154]: 󰠁
            - generic [ref=e156]: Invite New User
          - generic [ref=e157]:
            - button "Single" [ref=e158] [cursor=pointer]:
              - generic [ref=e159]: 󰀓
              - text: Single
            - button "Multiple" [ref=e160] [cursor=pointer]:
              - generic [ref=e161]: 󰀏
              - text: Multiple
        - separator [ref=e162]
        - generic [ref=e164]:
          - generic [ref=e165]:
            - generic [ref=e167]:
              - generic [ref=e169]: 󰇰
              - textbox "Email" [active] [ref=e171]:
                - /placeholder: colleague@company.com
                - text: m.habib@cyberneticlabs.io
              - generic:
                - generic:
                  - generic: Email
            - alert [ref=e172]
          - generic [ref=e174]:
            - combobox [ref=e176] [cursor=pointer]:
              - generic [ref=e178]: 󰨒
              - generic [ref=e180]:
                - generic [ref=e182]: User
                - combobox "Role": User
              - generic [ref=e184]: 󰍝
              - generic:
                - generic:
                  - generic: Role
            - alert [ref=e185]
        - separator [ref=e187]
        - generic [ref=e188]:
          - button "Cancel" [ref=e189] [cursor=pointer]:
            - generic [ref=e190]: Cancel
          - button "Send Invite" [ref=e191] [cursor=pointer]:
            - generic [ref=e193]: 󰒊
            - generic [ref=e194]: Send Invite
```

# Test source

```ts
  509 |     if (!hasMemberPage) {
  510 |       console.log('No member-management page accessible -- injecting mock invite panel for deduplication test');
  511 | 
  512 |       // Navigate to a settings page as the base
  513 |       await page.goto(`${BASE}/settings/organization`);
  514 |       await page.waitForLoadState('networkidle', { timeout: 10000 });
  515 | 
  516 |       // Mock invite API to return "already a member" for the known user
  517 |       await page.route('**/api/organization/members/invite*', async route => {
  518 |         if (route.request().method() === 'POST') {
  519 |           await route.fulfill({
  520 |             status: 422,
  521 |             contentType: 'application/json',
  522 |             body: JSON.stringify({ message: 'User is already a member of this organization' }),
  523 |           });
  524 |         } else {
  525 |           await route.continue();
  526 |         }
  527 |       });
  528 | 
  529 |       await injectMockInvitePanel(page);
  530 | 
  531 |       await page.locator('#e2e-invite-email').fill(VALID_EMAIL);
  532 |       await page.waitForTimeout(300);
  533 |       await page.locator('#e2e-invite-send').click();
  534 |       await page.waitForTimeout(1000);
  535 |       await page.screenshot({ path: 'screenshots/tc21-duplicate-invite-error.png' });
  536 | 
  537 |       const dupError = await page.locator('#e2e-invite-error').innerText().catch(() => '');
  538 |       console.log('Duplicate invite error message:', dupError);
  539 |       expect(dupError.length, 'Duplicate invite should surface an error message').toBeGreaterThan(0);
  540 |       expect(
  541 |         /already|member|exist|duplicate/i.test(dupError),
  542 |         'Error should indicate the user is already a member'
  543 |       ).toBeTruthy();
  544 |       return;
  545 |     }
  546 | 
  547 |     await page.screenshot({ path: 'screenshots/tc21-member-page.png' });
  548 |     const pageText = await page.locator('body').innerText();
  549 |     console.log('Member page content:', pageText.substring(0, 800));
  550 | 
  551 |     // Verify current user is not listed more than once (deduplication sanity check)
  552 |     const escapedEmail = VALID_EMAIL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  553 |     const emailMatches = (pageText.match(new RegExp(escapedEmail, 'gi')) || []).length;
  554 |     console.log(`Email "${VALID_EMAIL}" appears ${emailMatches} time(s) on member page`);
  555 |     if (emailMatches > 0) {
  556 |       expect(emailMatches, 'Current member should appear exactly once -- no duplicate member entries').toBe(1);
  557 |     }
  558 | 
  559 |     // Attempt to invite the already-existing member and assert the error
  560 |     const inviteBtn = page.locator('button, a').filter({ hasText: /invite|add.?member/i }).first();
  561 |     const hasInviteBtn = await inviteBtn.isVisible({ timeout: 3000 }).catch(() => false);
  562 |     console.log('Invite button found:', hasInviteBtn);
  563 | 
  564 |     if (hasInviteBtn) {
  565 |       await inviteBtn.click();
  566 |       await page.waitForTimeout(500);
  567 |       await page.screenshot({ path: 'screenshots/tc21-invite-dialog.png' });
  568 | 
  569 |       const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
  570 |       if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
  571 |         await emailInput.fill(VALID_EMAIL);
  572 |         await page.waitForTimeout(300);
  573 | 
  574 |         const sendBtn = page.locator('button').filter({ hasText: /send|invite|add/i }).first();
  575 |         const isDisabled = await sendBtn.isDisabled({ timeout: 2000 }).catch(() => false);
  576 |         console.log('Send invite disabled for existing member email:', isDisabled);
  577 | 
  578 |         // Mock the invite POST to return "already member" 422 before submitting
  579 |         await page.route('**', async route => {
  580 |           const req = route.request();
  581 |           if ((req.resourceType() === 'fetch' || req.resourceType() === 'xhr') && req.method() === 'POST') {
  582 |             await route.fulfill({
  583 |               status: 422,
  584 |               contentType: 'application/json',
  585 |               body: JSON.stringify({ message: 'User is already a member of this organization' }),
  586 |             });
  587 |             return;
  588 |           }
  589 |           await route.continue();
  590 |         });
  591 | 
  592 |         if (!isDisabled) {
  593 |           await sendBtn.click().catch(() => {});
  594 |           await page.waitForTimeout(1000);
  595 |           await page.screenshot({ path: 'screenshots/tc21-after-invite-submit.png' });
  596 |         }
  597 | 
  598 |         const errors = await page.locator(
  599 |           '.v-messages, .v-input__details, .v-alert, .v-snackbar__content, [class*="toast"], [class*="notification"]'
  600 |         ).allInnerTexts().catch(() => []);
  601 |         const bodySnippet = await page.locator('body').innerText();
  602 |         console.log('Invite errors for existing member:', errors);
  603 |         console.log('Body after invite submit:', bodySnippet.substring(0, 500));
  604 | 
  605 |         const hasDuplicateGuard = isDisabled ||
  606 |           errors.some(e => /already|exist|member|duplicate/i.test(e)) ||
  607 |           /already.{0,40}member|user.{0,40}already/i.test(bodySnippet);
  608 |         console.log('Duplicate-member guard triggered:', hasDuplicateGuard);
> 609 |         expect(hasDuplicateGuard, 'Duplicate member invite should be rejected').toBeTruthy();
      |                                                                                 ^ Error: Duplicate member invite should be rejected
  610 |       }
  611 |     } else {
  612 |       console.log('Invite button not found on member page -- injecting mock panel');
  613 | 
  614 |       await page.route('**/api/organization/members/invite*', async route => {
  615 |         if (route.request().method() === 'POST') {
  616 |           await route.fulfill({
  617 |             status: 422,
  618 |             contentType: 'application/json',
  619 |             body: JSON.stringify({ message: 'User is already a member of this organization' }),
  620 |           });
  621 |         } else {
  622 |           await route.continue();
  623 |         }
  624 |       });
  625 | 
  626 |       await injectMockInvitePanel(page);
  627 |       await page.locator('#e2e-invite-email').fill(VALID_EMAIL);
  628 |       await page.waitForTimeout(300);
  629 |       await page.locator('#e2e-invite-send').click();
  630 |       await page.waitForTimeout(1000);
  631 |       await page.screenshot({ path: 'screenshots/tc21-duplicate-invite-error.png' });
  632 | 
  633 |       const dupError = await page.locator('#e2e-invite-error').innerText().catch(() => '');
  634 |       console.log('Duplicate invite error message:', dupError);
  635 |       expect(dupError.length, 'Duplicate invite should surface an error message').toBeGreaterThan(0);
  636 |       expect(
  637 |         /already|member|exist|duplicate/i.test(dupError),
  638 |         'Error should indicate the user is already a member'
  639 |       ).toBeTruthy();
  640 |     }
  641 |   });
  642 | });
  643 | 
```