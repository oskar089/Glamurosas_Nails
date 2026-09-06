import { BasePage } from "../base-page";

export class GalleryPage extends BasePage {
  constructor(page) {
    super(page);
    this.figures = page.getByRole("figure");
    this.filters = page.getByRole("group", {
      name: "Filter inspiration by style",
    });
  }

  async filter(label) {
    await this.filters
      .getByRole("button", { name: label, exact: true })
      .click();
  }
}
