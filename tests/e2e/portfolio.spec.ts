import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // the HTML is prerendered, so wait for hydration before interacting
  await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
});

test('hero renders and Run flow executes nodes in order', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName('Kunal Kumar');
  await page.getByRole('button', { name: 'Run flow' }).click();
  await expect(page.locator('[data-node="top"]')).toHaveClass(/done/, { timeout: 5_000 });
  await expect(page.locator('[data-node="work"]')).toHaveClass(/running|done/);
  await page.getByRole('button', { name: /Stop/ }).click();
  await expect(page.getByRole('button', { name: 'Run flow' })).toBeVisible({ timeout: 5_000 });
});

test('DWAR journey steps through the volunteer flow', async ({ page }) => {
  const steps = page.getByRole('tablist', { name: 'Journey steps' });
  await steps.scrollIntoViewIfNeeded();
  await steps.getByRole('tab', { name: /Certificate/ }).click();
  await expect(page.locator('.j-detail')).toContainText('pdf-lib');
  await expect(page.getByRole('link', { name: /Visit dwar.org.in/ })).toHaveAttribute('href', 'https://dwar.org.in');
});

test('steris grid: debounced server search, infinite scroll and Excel export', async ({ page }) => {
  await page.getByRole('tab', { name: /Steris/ }).click();
  const search = page.getByRole('textbox', { name: 'Search learners' });
  await expect(page.getByTestId('loaded-count')).toHaveText('50');
  await search.pressSequentially('endoscopy', { delay: 40 });
  await expect(page.getByTestId('keystroke-count')).toHaveText('9');
  await expect(page.locator('.gd-meta')).toContainText('of 2,030');
  // 9 keystrokes inside the debounce window → just the initial load plus one search
  expect(Number(await page.getByTestId('search-count').textContent())).toBeLessThanOrEqual(3);

  const grid = page.getByLabel('Learner grid');
  await grid.evaluate((el) => (el.scrollTop = el.scrollHeight));
  await expect(page.getByTestId('loaded-count')).toHaveText('100');

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Bulk actions' }).click();
  await page.getByRole('menuitem', { name: 'Export view' }).click();
  await page.getByRole('menuitem', { name: 'Excel (.xlsx)' }).click();
  expect((await download).suggestedFilename()).toBe('steris-learners-endoscopy.xlsx');
});

test('steris form: choices cascade into eligible courses', async ({ page }) => {
  await page.getByRole('tab', { name: /Steris/ }).click();
  await page.getByRole('button', { name: /Assignment form/ }).click();
  await page.getByRole('combobox', { name: 'Facility' }).click();
  await page.getByRole('option', { name: 'Harbor Health' }).click();
  await page.getByRole('combobox', { name: 'Department' }).click();
  await page.getByRole('option', { name: 'Endoscopy' }).click();
  await page.getByRole('combobox', { name: 'Learners' }).click();
  await page.getByRole('option').first().click();
  await page.keyboard.press('Escape');
  await page.getByRole('combobox', { name: 'Course' }).click();
  await page.getByRole('option', { name: /IC-204/ }).click();
  await expect(page.locator('.fd-summary')).toContainText('ready to submit');
  await page.getByRole('button', { name: 'Create assignment' }).click();
  await expect(page.getByRole('alert')).toContainText('Assigned IC-204');
});

test('design tokens re-theme the MUI component set', async ({ page }) => {
  await page.getByRole('tab', { name: /Steris/ }).click();
  await page.getByRole('button', { name: /MUI theming/ }).click();
  const slider = page.getByRole('slider', { name: 'shape.borderRadius' });
  await slider.focus();
  await page.keyboard.press('End');
  await expect(page.getByLabel('Generated theme')).toContainText('borderRadius: 22');
});

test('outreach plan simulates providers, AI forwarding and GuardDuty', async ({ page }) => {
  await page.getByRole('button', { name: /Outreach plan/ }).click();
  await page.getByRole('button', { name: 'Simulate outreach' }).click();
  const log = page.getByLabel('Outreach events');
  await expect(log).toContainText('forwarded', { timeout: 10_000 });
  await expect(log).toContainText('guardduty.scan');
  await expect(log).toContainText('outreach plan complete', { timeout: 10_000 });
});

test('test jig runs every gate', async ({ page }) => {
  await page.getByRole('button', { name: 'Run the test jig' }).click();
  await expect(page.locator('.jig-log')).toContainText('all gates passed', { timeout: 15_000 });
});

test('experience filter dims records that do not match', async ({ page }) => {
  await page.getByRole('group', { name: 'Filter experience' }).getByRole('button', { name: 'Backend', exact: true }).click();
  await expect(page.locator('.records .rec:not(.dim)')).toHaveCount(4);
});

test('rules engine updates the segment live', async ({ page }) => {
  const count = page.getByTestId('segment-count');
  await count.scrollIntoViewIfNeeded();
  const before = Number(await count.textContent());
  await page.getByRole('button', { name: /match any/ }).click();
  await expect.poll(async () => Number(await count.textContent())).toBeGreaterThan(before);
});

test('case study tabs swap the live demo', async ({ page }) => {
  await page.getByRole('tab', { name: /Qollective/ }).click();
  await page.getByRole('button', { name: /Does he do backend\?/ }).click();
  await expect(page.getByText(/intent: backend/)).toBeVisible();
});

test('API playground returns validation errors', async ({ page }) => {
  await page.getByRole('button', { name: /Validation error/ }).click();
  await expect(page.getByTestId('api-status')).toHaveText('422');
  await expect(page.locator('.res-body')).toContainText('A valid email is required');
});

test('command palette navigates with the keyboard', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard shortcut is a desktop affordance');
  await page.keyboard.press('ControlOrMeta+k');
  const input = page.getByRole('dialog', { name: 'Command menu' }).getByRole('combobox');
  await expect(input).toBeFocused();
  await input.fill('experience');
  await page.keyboard.press('Enter');
  await expect(page.locator('#experience')).toBeInViewport();
});

test('canvas theme persists across reloads', async ({ page }) => {
  const html = page.locator('html');
  const initial = await html.getAttribute('data-theme');
  await page.getByRole('button', { name: /Switch to (light|dark) canvas/ }).click();
  await expect(html).not.toHaveAttribute('data-theme', initial!);
  await page.reload();
  await expect(html).not.toHaveAttribute('data-theme', initial!);
});

test('contact form validates before opening mail', async ({ page }) => {
  await page.locator('#contact').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('alert').first()).toBeVisible();
});

test('no horizontal overflow', async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

for (const theme of ['light', 'dark']) {
  test(`prerendered page hydrates cleanly (${theme})`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.addInitScript((t) => localStorage.setItem('kk-theme', t), theme);
    // the raw HTML already contains the content, before any script runs
    const res = await page.request.get('/');
    expect(await res.text()).toContain('serious interfaces');
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect(page.locator('html')).toHaveAttribute('data-hydrated', 'true');
    await page.waitForTimeout(500);
    expect(errors).toEqual([]);
  });
}
