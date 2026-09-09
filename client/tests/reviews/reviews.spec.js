import { expect, test } from "@playwright/test";
import { ReviewsPage } from "./reviews-page";

test("review validation and keyboard rating work without local persistence", async ({
  page,
}) => {
  const reviews = new ReviewsPage(page);
  await reviews.blockExternalAssets();
  await reviews.goto("/reviews");
  await expect(reviews.reviews).toHaveCount(0);
  await reviews.submit.click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(reviews.name).toBeFocused();
  await reviews.name.fill("Lucía");
  await page.getByRole("radio", { name: "1 estrella", exact: true }).focus();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("radio", { name: "5 estrellas", exact: true }),
  ).toBeChecked();
  await reviews.comment.fill("Short");
  await reviews.submit.click();
  await expect(
    page.getByText("Escribe al menos 10 caracteres para tu reseña.", {
      exact: true,
    }),
  ).toBeVisible();
  const sample = "A beautiful sample <img src=x onerror=alert(1)> experience.";
  await reviews.comment.fill(sample);
  const writes = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") writes.push(request.url());
  });
  await reviews.submit.click();
  await expect(page.getByRole("alert")).toContainText(
    "El servicio de reseñas no está disponible.",
  );
  await expect(reviews.reviews).toHaveCount(0);
  expect(writes).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
  await expect(reviews.comment).toHaveValue(sample);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(reviews.reviews).toHaveCount(0);
  await expect(page.getByText(sample, { exact: false })).toHaveCount(0);
});
