import { BasePage } from "../base-page";

export class ReviewsPage extends BasePage {
  constructor(page) {
    super(page);
    this.comment = page.getByLabel("Your thoughts (required)", { exact: true });
    this.submit = page.getByRole("button", { name: "Add a demo review" });
    this.reviews = this.main.getByRole("article");
  }
}
