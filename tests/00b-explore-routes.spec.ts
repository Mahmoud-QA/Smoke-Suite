import { test, Page } from '@playwright/test';

const BASE = process.env.BASE_URL || 'https://app.synkvault.net';
const EMAIL = 'm.habib@cyberneticlabs.io';
const PASSWORD = 'SynkVault@123';

async function login(page: Page) {
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('button:has-text("SIGN IN")', { timeout: 10000 });
  await page.locator('input[type="email"]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await page.getByRole('button', { name: 'SIGN IN' }).click();
  await page.waitForLoadState('networkidle', { timeout: 15000 });
  await page.keyboard.press('Escape'); // dismiss onboarding modal
  await page.waitForTimeout(500);
}

test('click M avatar to find settings/profile routes', async ({ page }) => {
  await login(page);

  // The M avatar is the last button in the app bar (top right)
  // It's a v-btn with a v-avatar child
  const avatarBtn = page.locator('.v-app-bar .v-btn').last();
  await avatarBtn.screenshot({ path: 'screenshots/route-01-avatar-btn.png' }).catch(() => {});
  console.log('Avatar btn visible:', await avatarBtn.isVisible());

  await avatarBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'screenshots/route-02-user-menu-open.png' });
  console.log('URL after avatar click:', page.url());

  // Capture menu items
  const menuItems = await page.locator('.v-list-item, .v-menu .v-list-item, [role="menuitem"]').allTextContents();
  console.log('User menu items:', menuItems);

  // Get all links in the opened menu
  const menuLinks = await page.locator('.v-overlay--active a[href], .v-menu a[href]').all();
  for (const link of menuLinks) {
    console.log('Menu link:', await link.getAttribute('href'), '|', await link.innerText());
  }
  await page.keyboard.press('Escape');
});

test('discover all app routes by probing common paths', async ({ page }) => {
  await login(page);

  const routesToProbe = [
    '/settings',
    '/settings/profile',
    '/settings/organization',
    '/settings/team',
    '/settings/members',
    '/settings/integrations',
    '/settings/billing',
    '/settings/subscription',
    '/org/settings',
    '/org/members',
    '/org/billing',
    '/organization',
    '/organization/settings',
    '/organization/members',
    '/account',
    '/account/settings',
    '/profile',
    '/team',
    '/members',
    '/admin',
    '/admin/billing',
    '/subscription',
    '/plan',
  ];

  const found: { route: string; title: string; text: string }[] = [];
  const notFound: string[] = [];

  for (const route of routesToProbe) {
    await page.goto(`${BASE}${route}`);
    await page.waitForLoadState('networkidle', { timeout: 8000 });
    const url = page.url();
    const bodyText = (await page.locator('body').innerText()).substring(0, 100);
    const title = await page.title();

    if (bodyText.includes('404') || bodyText.includes('not found')) {
      notFound.push(route);
    } else if (url !== `${BASE}/` && !url.includes('/login') && !url.includes('/auth')) {
      found.push({ route, title, text: bodyText });
      await page.screenshot({ path: `screenshots/route-${route.replace(/\//g, '_')}.png` }).catch(() => {});
    } else {
      notFound.push(`${route} â†’ redirected to ${url.replace(BASE, '')}`);
    }
  }

  console.log('\n=== ROUTES FOUND ===');
  for (const r of found) {
    console.log(`âœ… ${r.route} â€” "${r.text.substring(0, 80)}"`);
  }
  console.log('\n=== ROUTES NOT FOUND ===');
  for (const r of notFound) {
    console.log(`âŒ ${r}`);
  }
});

test('click through sidebar and header to find all navigation', async ({ page }) => {
  await login(page);

  // Click integrations link to find the route
  await page.getByRole('link', { name: 'GO TO INTEGRATIONS' }).first().click();
  await page.waitForLoadState('networkidle', { timeout: 8000 });
  await page.screenshot({ path: 'screenshots/route-integrations.png' });
  console.log('Integrations URL:', page.url());
  const integrationsText = (await page.locator('body').innerText()).substring(0, 300);
  console.log('Integrations page:', integrationsText);

  // Go back and look at sidebar more carefully
  await page.goto(`${BASE}/`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Hover over sidebar icons to see tooltips
  const sidebarIcons = await page.locator('.v-navigation-drawer button, .v-navigation-drawer a, aside button, aside a').all();
  console.log(`Sidebar icon count: ${sidebarIcons.length}`);
  for (const icon of sidebarIcons) {
    const title = await icon.getAttribute('title');
    const ariaLabel = await icon.getAttribute('aria-label');
    const href = await icon.getAttribute('href');
    const text = await icon.innerText().catch(() => '');
    console.log(`Sidebar item: title="${title}" aria-label="${ariaLabel}" href="${href}" text="${text.trim()}"`);
  }

  // Look at bottom of sidebar for settings
  await page.screenshot({ path: 'screenshots/route-sidebar-full.png' });

  // Scroll sidebar to bottom
  await page.locator('.v-navigation-drawer, aside').first().evaluate(el => el.scrollTo(0, el.scrollHeight)).catch(() => {});
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'screenshots/route-sidebar-bottom.png' });

  // Find any cog/settings icons at bottom of sidebar
  const bottomIcons = await page.locator('.v-navigation-drawer .v-list-item, aside .v-list-item').allTextContents();
  console.log('Sidebar list items:', bottomIcons);
});
