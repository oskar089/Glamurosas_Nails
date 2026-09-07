import { BasePage } from "../base-page";

export class ReviewsPage extends BasePage {
  constructor(page) {
    super(page);
    this.comment = page.getByLabel("Tus comentarios (obligatorios)", {
      exact: true,
    });
    this.submit = page.getByRole("button", {
      name: "Añadir una reseña de demostración",
    });
    this.reviews = this.main.getByRole("article");
  }
}
