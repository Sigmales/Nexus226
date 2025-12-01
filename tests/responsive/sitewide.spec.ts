/*
import { test, expect } from '@playwright/test';

test('desktop shows 4-column grid on xl', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/categories/nexushub');
    // Wait for grid
    const grid = page.locator('[data-testid="nexushub-grid"]');
    await expect(grid).toBeVisible();
    // assert grid has 4 columns via computed style or class
    const classList = await grid.getAttribute('class');
    expect(classList).toMatch(/xl:grid-cols-4|grid-cols-4/);
    // ensure no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
});

test('mobile modal is full-screen and role=dialog', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/categories/nexushub');
    await page.click('[data-testid="nexushub-contact-button"]'); // ensure buttons have test ids
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    const rect = await dialog.boundingBox();
    expect(rect?.width).toBeGreaterThan(300); // roughly full width on mobile
});

test('header remains sticky on scroll', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 800));
    // header should still be visible at top
    await expect(header).toHaveCSS('position', /sticky|fixed/);
});
*/
