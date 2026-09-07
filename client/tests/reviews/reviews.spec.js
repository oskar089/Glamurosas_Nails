import { expect, test } from "@playwright/test";
import { ReviewsPage } from "./reviews-page";

test("review validation and keyboard rating work; a safe local review is lost on reload", async ({
  page,
}) => {
  const reviews = new ReviewsPage(page);
  await reviews.blockExternalAssets();
  await reviews.goto("/reviews");
  await expect(reviews.reviews).toHaveCount(3);
  await reviews.submit.click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(
    page.getByRole("radio", { name: "1 estrella", exact: true }),
  ).toBeFocused();
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
    page.getByText(
      "Escribe al menos 10 caracteres para tu reseña de demostración.",
      { exact: true },
    ),
  ).toBeVisible();
  const sample = "A beautiful sample <img src=x onerror=alert(1)> experience.";
  await reviews.comment.fill(sample);
  const writes = [];
  page.on("request", (request) => {
    if (request.method() !== "GET") writes.push(request.url());
  });
  await reviews.submit.click();
  await expect(page.getByRole("status")).toContainText(
    "No se publica y desaparecerá al recargar.",
  );
  await expect(reviews.reviews).toHaveCount(4);
  await expect(reviews.reviews.first()).toContainText(sample);
  await expect(reviews.reviews.first().getByRole("img")).toHaveCount(1);
  await expect(reviews.reviews.first().getByRole("img")).toHaveAttribute(
    "aria-label",
    "5 de 5 estrellas",
  );
  expect(writes).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
  await expect(reviews.comment).toHaveValue("");
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(reviews.reviews).toHaveCount(3);
  await expect(page.getByText(sample, { exact: false })).toHaveCount(0);
});
