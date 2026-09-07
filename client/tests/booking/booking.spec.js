import { expect, test } from "@playwright/test";
import { BookingPage } from "./booking-page";

test("service selection carries into the booking request", async ({ page }) => {
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
    page.getByText("SOLICITUD RECIBIDA", { exact: true }),
  ).toHaveCount(0);
});

test("valid booking posts to the API, confirms the request, and clears personal details", async ({
  page,
}) => {
  const booking = new BookingPage(page);
  await booking.blockExternalAssets();
  await booking.goto("/booking");
  await booking.fillValid();
  const tomorrow = await page.evaluate(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  });
  const clientToday = await page.evaluate(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  });
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/api/bookings") &&
      response.status() === 201,
  );
  await booking.submit.click();
  const response = await responsePromise;
  expect(response.request().postDataJSON()).toEqual({
    name: "Alex Example",
    email: "alex@example.com",
    service: "gel",
    date: tomorrow,
    time: "10:30",
    clientToday,
  });
  const created = await response.json();
  expect(created.id).toEqual(expect.any(Number));
  await expect(page.getByRole("status")).toContainText(
    "Tu solicitud se guardó correctamente.",
  );
  await expect(page.getByRole("status")).toContainText(
    "La disponibilidad de la fecha y hora queda pendiente de confirmación.",
  );
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
  await page.getByRole("button", { name: "Enviar otra solicitud" }).click();
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
  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/api/bookings") &&
      response.status() === 201,
  );
  await booking.submit.click();
  const response = await responsePromise;
  expect(response.request().postDataJSON()).toEqual({
    name: "Alex Example",
    email: "alex@example.com",
    service: "gel",
    date: "2026-09-06",
    time: "10:30",
    clientToday: "2026-09-06",
  });
  await expect(page.getByRole("status")).toContainText(
    "6 de septiembre de 2026",
  );
});
