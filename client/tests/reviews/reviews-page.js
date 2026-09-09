import { BasePage } from "../base-page";

export class ReviewsPage extends BasePage {
  constructor(page) {
    super(page);
    this.name = page.getByLabel("Tu nombre (obligatorio)", {
      exact: true,
    });
    this.comment = page.getByLabel("Tus comentarios (obligatorios)", {
      exact: true,
    });
    this.submit = page.getByRole("button", {
      name: "Compartir mi experiencia",
    });
    this.reviews = this.main.getByRole("article");
  }
}
