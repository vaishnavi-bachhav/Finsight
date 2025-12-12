// tests/landing.spec.js
import { test, expect } from "@playwright/test";

test.describe("FinSight landing page", () => {
  test("shows brand, hero, and CTA elements", async ({ page }) => {
    await page.goto("/");

    // Brand name in navbar: use the .brand-name class to avoid strict mode issues
    const brandName = page.locator(".brand-name");
    await expect(brandName).toHaveText("FinSight");

    // Tagline under brand
    await expect(
      page.getByText("Control every dollar, every month")
    ).toBeVisible();

    // Hero heading
    await expect(
      page.getByRole("heading", { name: /See your money clearly\./i })
    ).toBeVisible();

    // Hero subtitle
    await expect(
      page.getByText(/FinSight helps you track expenses, visualize your cashflow/i)
    ).toBeVisible();

    // Primary CTA (signed-out)
    const ctaButton = page.getByRole("button", { name: /get started free/i });
    await expect(ctaButton).toBeVisible();

    // Secondary CTA
    const howItWorksBtn = page.getByRole("button", { name: /how it works/i });
    await expect(howItWorksBtn).toBeVisible();

    // Feature card headings
    await expect(
      page.getByRole("heading", { name: /Smart Analytics/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Transactions, Simplified/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Secure by Design/i })
    ).toBeVisible();

    // "How FinSight works" section
    await expect(
      page.getByRole("heading", { name: /How FinSight works/i })
    ).toBeVisible();

    // Footer tech stack text
    await expect(
      page.getByText(/Clerk Auth · MongoDB · Express · React · Vite/i)
    ).toBeVisible();
  });
});
