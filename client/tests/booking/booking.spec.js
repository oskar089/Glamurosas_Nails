import { expect, test } from "@playwright/test";
import { BookingPage, GOOGLE_CALENDAR_APPOINTMENTS_URL } from "./booking-page";

test("service selection carries into the Calendar booking page", async ({
  page,
}) => {
  const booking = new BookingPage(page);
  await booking.blockExternalAssets();
  await booking.goto("/services");
  await page
    .getByRole("link", { name: "Probar la cita para Acrílicas" })
    .click();

  await expect(
    page.getByRole("heading", { name: "Acrílicas", exact: true }),
  ).toBeVisible();
  await expect(booking.calendarLink).toBeVisible();
  await expect(booking.main).toBeFocused();
});

test("booking page uses Google Calendar instead of a local form", async ({
  page,
}) => {
  const booking = new BookingPage(page);
  await booking.blockExternalAssets();
  await booking.goto("/booking?service=unknown");

  await expect(booking.calendarLink).toHaveAttribute(
    "href",
    GOOGLE_CALENDAR_APPOINTMENTS_URL,
  );
  await expect(booking.calendarLink).toHaveAttribute("target", "_blank");
  await expect(
    page.getByText(/Google Calendar muestra los horarios disponibles/),
  ).toBeVisible();
  await expect(booking.name).toHaveCount(0);
  await expect(booking.email).toHaveCount(0);
  await expect(booking.service).toHaveCount(0);
  await expect(booking.date).toHaveCount(0);
  await expect(booking.time).toHaveCount(0);
});

test("booking page does not post personal details locally", async ({
  page,
}) => {
  const apiRequests = [];
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      request.url().endsWith("/api/bookings")
    ) {
      apiRequests.push(request.url());
    }
  });

  const booking = new BookingPage(page);
  await booking.blockExternalAssets();
  await booking.goto("/booking");

  await expect(booking.calendarLink).toBeVisible();
  expect(apiRequests).toEqual([]);
  expect(
    await page.evaluate(() => ({
      local: localStorage.length,
      session: sessionStorage.length,
    })),
  ).toEqual({ local: 0, session: 0 });
});
