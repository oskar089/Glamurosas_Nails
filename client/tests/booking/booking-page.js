import { BasePage } from "../base-page";

export const GOOGLE_CALENDAR_APPOINTMENTS_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ04lNU9EX8RIuRrbaUyWd8jnH7IAIxq9MIWSebI5lJO05QQSgrpNw6kKg2Yy6okKwVWxi59UHyl";

export class BookingPage extends BasePage {
  constructor(page) {
    super(page);
    this.calendarLink = page.getByRole("link", {
      name: "Ver disponibilidad en Google Calendar",
    });
    this.name = page.getByLabel("Tu nombre", { exact: true });
    this.email = page.getByLabel("Dirección de correo electrónico", {
      exact: true,
    });
    this.service = page.getByLabel("Elige tu servicio", { exact: true });
    this.date = page.getByLabel("Fecha preferida", { exact: true });
    this.time = page.getByLabel("Hora preferida", { exact: true });
  }
}
