import { expect, test } from "@playwright/test";
import { GalleryPage } from "./gallery-page";

test("every gallery filter updates the photos, count, and selected semantics", async ({
  page,
}) => {
  const gallery = new GalleryPage(page);
  await gallery.blockExternalAssets();
  await gallery.goto("/gallery");
  await expect(gallery.figures).toHaveCount(6);
  for (const [label, count] of [
    ["Acrílico", 1],
    ["Gel", 2],
    ["Decoración de uñas", 2],
    ["Clásica", 1],
    ["Toda la inspiración", 6],
  ]) {
    await gallery.filter(label);
    await expect(
      gallery.filters.getByRole("button", { name: label, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(gallery.figures).toHaveCount(count);
    await expect(page.getByRole("status")).toHaveText(
      `${count} ${count === 1 ? "imagen" : "imágenes"} de inspiración`,
    );
  }
  await gallery.goto("/gallery?category=classic");
  await expect(gallery.figures).toHaveCount(1);
  await expect(
    gallery.filters.getByRole("button", { name: "Clásica", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("unavailable external photography has a labeled, stable fallback", async ({
  page,
}) => {
  const gallery = new GalleryPage(page);
  await gallery.blockExternalAssets();
  await gallery.goto("/gallery?category=classic");
  await expect(
    page.getByRole("img", {
      name: /La imagen de inspiración no está disponible/,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("La imagen no está disponible en este momento", {
      exact: true,
    }),
  ).toBeVisible();
  const bounds = await gallery.figures.boundingBox();
  expect(bounds.height).toBeGreaterThan(150);
});
