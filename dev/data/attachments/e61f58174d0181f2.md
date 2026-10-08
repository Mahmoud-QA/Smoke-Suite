# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 00-explore-nav.spec.ts >> TC-442 | User avatar menu opens and contains a logout option >> avatar button in app bar opens dropdown with Sign Out option
- Location: tests/00-explore-nav.spec.ts:208:7

# Error details

```
Error: Avatar menu must open and contain at least one item

expect(received).toBeTruthy()

Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e9]:
    - generic [ref=e11]:
      - img "SynkVault Logo" [ref=e13]
      - button "Language selector" [ref=e15] [cursor=pointer]:
        - generic [ref=e17]: 󰖟
    - generic [ref=e20]:
      - heading "Sign In" [level=1] [ref=e21]
      - generic [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e25]:
            - generic [ref=e27]: 󰇮
            - textbox "Email" [ref=e29]: m.habib@cyberneticlabs.io
            - generic:
              - generic:
                - generic: Email
          - alert [ref=e30]
        - generic [ref=e32]:
          - generic [ref=e34]:
            - generic [ref=e36]: 󰌾
            - textbox "Password" [ref=e38]: SynkVault@123
            - generic:
              - generic:
                - generic: Password
          - alert [ref=e39]
        - generic [ref=e43]:
          - generic [ref=e45]:
            - generic [ref=e46]: 󰄱
            - checkbox "Remember me for 1 day" [ref=e47] [cursor=pointer]
          - generic [ref=e49] [cursor=pointer]:
            - generic [ref=e50]: Remember me for 1 day
            - generic [ref=e51]: 󰋽
        - button "Sign In" [ref=e52] [cursor=pointer]:
          - generic [ref=e53]: Sign In
      - alert [ref=e55]:
        - generic [ref=e57]: 󰅙
        - generic [ref=e58]: Invalid login credentials
        - button "Close" [ref=e60] [cursor=pointer]:
          - generic [ref=e62]: 󰅖
      - generic [ref=e63]:
        - button "Forgot Password?" [ref=e64] [cursor=pointer]:
          - generic [ref=e65]: Forgot Password?
        - generic [ref=e66]:
          - separator [ref=e67]
          - paragraph [ref=e68]: Don't have an account?
          - button "Sign Up" [ref=e69] [cursor=pointer]:
            - generic [ref=e70]: Sign Up
  - generic:
    - tooltip
```

# Test source

```ts
  158 |   // Look for the CYBERNETICLABS.IO org name button in header to find org settings
  159 |   const headerOrgBtn = page.locator('.v-app-bar').locator('button, [role="button"]').nth(1);
  160 |   if (await headerOrgBtn.isVisible().catch(() => false)) {
  161 |     await headerOrgBtn.click();
  162 |     await page.waitForTimeout(500);
  163 |     await page.screenshot({ path: 'screenshots/nav-13-org-btn.png' });
  164 |     console.log('After org btn click URL:', page.url());
  165 |   }
  166 | });
  167 | 
  168 | test.describe('TC-441 | All sidebar navigation links route to their expected destinations', () => {
  169 |   test('every known app route loads without 404 or login redirect while authenticated', async ({ page }) => {
  170 |     await loginAndDismissModal(page);
  171 | 
  172 |     const navLinks = await page.locator('.v-navigation-drawer a[href], aside a[href]').all();
  173 |     const hrefRoutes = (await Promise.all(navLinks.map(l => l.getAttribute('href').catch(() => '')))).filter(h => h && !h.startsWith('http'));
  174 |     console.log('Sidebar <a href> routes found:', hrefRoutes);
  175 | 
  176 |     const knownRoutes = ['/', '/integrations', '/ontology', '/settings/billing', '/my-documents'];
  177 |     const allRoutes = [...new Set([...hrefRoutes, ...knownRoutes])];
  178 |     console.log('Testing routes:', allRoutes);
  179 | 
  180 |     const results: { route: string; finalUrl: string; ok: boolean }[] = [];
  181 | 
  182 |     for (const route of allRoutes) {
  183 |       await page.goto(`${BASE}${route}`);
  184 |       await page.waitForLoadState('load', { timeout: 20000 });
  185 |       const modal = page.locator('.v-overlay--active .v-btn--icon').first();
  186 |       if (await modal.isVisible({ timeout: 1500 }).catch(() => false)) {
  187 |         await modal.click();
  188 |         await page.waitForTimeout(300);
  189 |       }
  190 | 
  191 |       const finalUrl = page.url();
  192 |       const bodyText = await page.locator('body').innerText().catch(() => '');
  193 |       const is404 = bodyText.toLowerCase().includes('page not found') || (bodyText.toLowerCase().includes('404') && bodyText.trim().length < 100);
  194 |       const redirectedToLogin = finalUrl.includes('/login');
  195 |       const ok = !is404 && !redirectedToLogin;
  196 | 
  197 |       results.push({ route, finalUrl, ok });
  198 |       console.log(`Route ${route} â†’ ${finalUrl} | OK: ${ok} | 404: ${is404} | LoginRedirect: ${redirectedToLogin}`);
  199 |     }
  200 | 
  201 |     const failedRoutes = results.filter(r => !r.ok);
  202 |     console.log('Failed routes:', failedRoutes);
  203 |     expect(failedRoutes.length, `Routes with errors: ${JSON.stringify(failedRoutes)}`).toBe(0);
  204 |   });
  205 | });
  206 | 
  207 | test.describe('TC-442 | User avatar menu opens and contains a logout option', () => {
  208 |   test('avatar button in app bar opens dropdown with Sign Out option', async ({ page }) => {
  209 |     await loginAndDismissModal(page);
  210 |     await page.screenshot({ path: 'screenshots/tc442-before-avatar-click.png' });
  211 | 
  212 |     // The "M" initial is inside a v-avatar inside a button â€” target v-avatar span directly
  213 |     const avatarWithInitial = page.locator('[class*="v-avatar"]').filter({ hasText: /^[A-Z]$/ }).first();
  214 |     const hasAvatarEl = await avatarWithInitial.isVisible({ timeout: 3000 }).catch(() => false);
  215 |     console.log('v-avatar with initial visible:', hasAvatarEl);
  216 | 
  217 |     if (hasAvatarEl) {
  218 |       await avatarWithInitial.evaluate((el: HTMLElement) => el.click());
  219 |     } else {
  220 |       const userInitialEl = await page.evaluate(() => {
  221 |         const spans = Array.from(document.querySelectorAll('span, div, button'));
  222 |         const match = spans.find(el => el.textContent?.trim().match(/^[A-Z]$/) && el.children.length === 0);
  223 |         if (match) {
  224 |           (match as HTMLElement).click();
  225 |           return { tag: match.tagName, cls: match.className, text: match.textContent };
  226 |         }
  227 |         return null;
  228 |       });
  229 |       console.log('User initial element found and clicked via evaluate:', userInitialEl);
  230 |     }
  231 |     await page.waitForTimeout(800);
  232 |     await page.screenshot({ path: 'screenshots/tc442-after-avatar-click.png' });
  233 | 
  234 |     const menuItems = await page.locator('[role="menuitem"], [role="option"], .v-list-item').allInnerTexts().catch(() => []);
  235 |     const filtered = menuItems.map(t => t.trim()).filter(t => t.length > 0);
  236 |     console.log('Menu items after avatar click:', filtered);
  237 | 
  238 |     const menuOpened = filtered.length > 0;
  239 |     const hasLogout = filtered.some(t =>
  240 |       t.toLowerCase().includes('sign out') ||
  241 |       t.toLowerCase().includes('log out') ||
  242 |       t.toLowerCase().includes('logout') ||
  243 |       t.toLowerCase().includes('signout')
  244 |     );
  245 |     const hasMyAccount = filtered.some(t => t.toLowerCase().includes('account'));
  246 |     const hasAdminPortal = filtered.some(t => t.toLowerCase().includes('admin'));
  247 | 
  248 |     console.log('Avatar menu opened:', menuOpened);
  249 |     console.log('Has Sign Out option:', hasLogout);
  250 |     console.log('Has My Account option:', hasMyAccount);
  251 |     console.log('Has Admin Portal option:', hasAdminPortal);
  252 | 
  253 |     if (!hasLogout) {
  254 |       console.log('FINDING: Avatar menu does not contain a Sign Out option in current build.');
  255 |       console.log('FINDING: Avatar menu contains:', filtered);
  256 |     }
  257 | 
> 258 |     expect(menuOpened, 'Avatar menu must open and contain at least one item').toBeTruthy();
      |                                                                               ^ Error: Avatar menu must open and contain at least one item
  259 |   });
  260 | });
  261 | 
```