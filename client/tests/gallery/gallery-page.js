import { BasePage } from "../base-page";

export class GalleryPage extends BasePage {
  constructor(page) {
    super(page);
    this.figures = page.getByRole("figure");
    this.filters = page.getByRole("group", {
      name: "Filtrar la inspiración por estilo",
    });
  }

  async filter(label) {
    await this.filters
      .getByRole("button", { name: label, exact: true })
      .click();
  }
}
