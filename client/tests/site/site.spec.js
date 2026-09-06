import { test, expect } from "@playwright/test";
import { SitePage } from "./site-page";

test("navigation supports keyboards, escape, route focus, and the not-found path", async ({
  page,
}, testInfo) => {
  const site = new SitePage(page);
  await site.blockExternalAssets();
  await site.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(site.main).toBeFocused();
  if (testInfo.project.name === "mobile") {
    await expect(site.navigation).toBeHidden();
    await site.menu.focus();
    await page.keyboard.press("Enter");
    await expect(site.menu).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    await expect(
      site.navigation.getByRole("link", { name: "Home", exact: true }),
    ).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(site.menu).toHaveAttribute("aria-expanded", "false");
    await expect(site.menu).toBeFocused();
    await site.menu.click();
  }
  await site.navigation
    .getByRole("link", { name: "Contact", exact: true })
    .click();
  await expect(site.main).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Good things are coming." }),
  ).toBeVisible();
  if (testInfo.project.name === "mobile")
    await expect(site.navigation).toBeHidden();
  await expect(page.locator('a[href^="tel:"], a[href^="mailto:"]')).toHaveCount(
    0,
  );
  await site.goto("/does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Let’s get you back to beautiful." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to home", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "A little polish.",
  );
});

test("every route fits its viewport and has one main heading without runtime errors", async ({
  page,
}) => {
  const site = new SitePage(page);
  await site.blockExternalAssets();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of [
    "/",
    "/services",
    "/gallery",
    "/booking",
    "/reviews",
    "/contact",
    "/missing",
  ]) {
    await site.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(site.main).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${path} should not overflow horizontally`,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("home renders real inspiration assets and captures a visual reference", async ({
  page,
}, testInfo) => {
  const site = new SitePage(page);
  await site.goto("/");
  const hero = page
    .getByRole("img", {
      name: "Black manicure with tortoiseshell accent nails and a gray knit sleeve",
      exact: true,
    })
    .first();
  await expect(hero).toBeVisible();
  await expect
    .poll(() =>
      hero.evaluate((image) => image.complete && image.naturalWidth > 0),
    )
    .toBe(true);
  await page.evaluate(() => document.fonts.ready);
  for (const photo of await page.locator("img[loading=lazy]").all()) {
    await photo.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        photo.evaluate((image) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: true,
    animations: "disabled",
  });
  await site.goto("/gallery");
  for (const photo of await page.locator("img[loading=lazy]").all()) {
    await photo.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        photo.evaluate((image) => image.complete && image.naturalWidth > 0),
      )
      .toBe(true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: testInfo.outputPath("gallery.png"),
    fullPage: true,
    animations: "disabled",
  });
});

test("small screens and reduced motion retain usable controls", async ({
  page,
}) => {
  const site = new SitePage(page);
  await site.blockExternalAssets();
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const path of ["/", "/gallery", "/booking", "/reviews"]) {
    await site.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${path} at 320px`,
    ).toBe(true);
  }
  const submit = page.getByRole("button", { name: "Add a demo review" });
  expect(
    await submit.evaluate(
      (button) => getComputedStyle(button).transitionDuration,
    ),
  ).toBe("0s");
});
