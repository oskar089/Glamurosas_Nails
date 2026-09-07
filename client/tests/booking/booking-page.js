import { BasePage } from "../base-page";

export class BookingPage extends BasePage {
  constructor(page) {
    super(page);
    this.name = page.getByLabel("Tu nombre", { exact: true });
    this.email = page.getByLabel("Dirección de correo electrónico", {
      exact: true,
    });
    this.service = page.getByLabel("Elige tu servicio", { exact: true });
    this.date = page.getByLabel("Fecha preferida", { exact: true });
    this.time = page.getByLabel("Hora de ejemplo", { exact: true });
    this.submit = page.getByRole("button", { name: "Ver mi cita de ejemplo" });
  }

  async fillValid() {
    await this.name.fill("Alex Example");
    await this.email.fill("alex@example.com");
    await this.service.selectOption("gel");
    const tomorrow = await this.page.evaluate(() => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    });
    await this.date.fill(tomorrow);
    await this.time.selectOption("10:30");
  }
}
