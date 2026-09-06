import { test, expect } from "@playwright/test";
import { GalleryPage } from "./gallery-page";

test("every gallery filter updates the photos, count, and selected semantics", async ({
  page,
}) => {
  const gallery = new GalleryPage(page);
  await gallery.blockExternalAssets();
  await gallery.goto("/gallery");
  await expect(gallery.figures).toHaveCount(6);
  for (const [label, count] of [
    ["Acrylic", 1],
    ["Gel", 2],
    ["Nail art", 2],
    ["Classic", 1],
    ["All inspiration", 6],
  ]) {
    await gallery.filter(label);
    await expect(
      gallery.filters.getByRole("button", { name: label, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(gallery.figures).toHaveCount(count);
    await expect(page.getByRole("status")).toHaveText(
      `${count} inspiration ${count === 1 ? "image" : "images"}`,
    );
  }
  await gallery.goto("/gallery?category=classic");
  await expect(gallery.figures).toHaveCount(1);
  await expect(
    gallery.filters.getByRole("button", { name: "Classic", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("unavailable external photography has a labeled, stable fallback", async ({
  page,
}) => {
  const gallery = new GalleryPage(page);
  await gallery.blockExternalAssets();
  await gallery.goto("/gallery?category=classic");
  await expect(
    page.getByRole("img", { name: /Inspiration photo unavailable/ }),
  ).toBeVisible();
  await expect(
    page.getByText("Photo currently unavailable", { exact: true }),
  ).toBeVisible();
  const bounds = await gallery.figures.boundingBox();
  expect(bounds.height).toBeGreaterThan(150);
});
