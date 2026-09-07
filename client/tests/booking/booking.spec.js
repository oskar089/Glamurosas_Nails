import { test, expect } from "@playwright/test";
import { BookingPage } from "./booking-page";

test("service selection carries into the booking demo", async ({ page }) => {
  const booking = new BookingPage(page);
  await booking.blockExternalAssets();
  await booking.goto("/services");
  await page
    .getByRole("link", { name: "Probar la cita para Extensiones acrílicas" })
    .click();
  await expect(booking.service).toHaveValue("acrylic");
  await expect(
    page.getByRole("heading", { name: "Extensiones acrílicas", exact: true }),
  ).toBeVisible();
  await expect(booking.main).toBeFocused();
  await booking.goto("/booking?service=unknown");
  await expect(booking.service).toHaveValue("");
});

test("empty fields, invalid email, and past dates are rejected accessibly", async ({
  page,
}) => {
  const booking = new BookingPage(page);
  await booking.blockExternalAssets();
  await booking.goto("/booking");
  await booking.submit.click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(booking.name).toBeFocused();
  await expect(booking.name).toHaveAttribute("aria-invalid", "true");
  await expect(booking.time).toHaveAttribute(
    "aria-describedby",
    "time-error time-hint",
  );
  await booking.fillValid();
  await booking.email.fill("invalid-email");
  await booking.date.fill("2001-01-01");
  await booking.submit.click();
  await expect(
    page.getByText("Introduce una dirección de correo electrónico válida.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("Elige hoy o una fecha futura.", { exact: true }),
  ).toBeVisible();
  await expect(booking.email).toBeFocused();
  await expect(
    page.getByText("DEMOSTRACIÓN COMPLETADA", { exact: true }),
  ).toHaveCount(0);
});

test("valid booking only confirms locally, clears personal details, and sends nothing", async ({
  page,
}) => {
  const booking = new BookingPage(page);
  await booking.blockExternalAssets();
  await booking.goto("/booking");
  await booking.fillValid();
  const submissionRequests = [];
  await page.route("**/*", (route) => {
    submissionRequests.push({
      url: route.request().url(),
      method: route.request().method(),
      body: route.request().postData(),
    });
    return route.abort();
  });
  await booking.submit.click();
  await expect(page.getByRole("status")).toContainText(
    "No se guardó, envió ni reservó ninguna cita.",
  );
  await expect(page.getByRole("status")).toContainText(
    "No se creó ningún evento de calendario ni correo electrónico.",
  );
  expect(submissionRequests).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
  await page.getByRole("button", { name: "Prueba otra demostración" }).click();
  await expect(booking.name).toHaveValue("");
  await expect(booking.email).toHaveValue("");
  await expect(booking.service).toHaveValue("");
});

test("minimum date follows the browser local day rather than UTC", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-09-07T00:30:00Z") });
  const booking = new BookingPage(page);
  await booking.blockExternalAssets();
  await booking.goto("/booking");
  await expect(booking.date).toHaveAttribute("min", "2026-09-06");
  await booking.fillValid();
  await booking.date.fill("2026-09-06");
  await booking.submit.click();
  await expect(page.getByRole("status")).toContainText(
    "6 de septiembre de 2026",
  );
});
