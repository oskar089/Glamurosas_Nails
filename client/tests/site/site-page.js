import { BasePage } from "../base-page";

export class SitePage extends BasePage {
  constructor(page) {
    super(page);
    this.navigation = page.getByRole("navigation", {
      name: "Main navigation",
      exact: true,
    });
    this.menu = page.getByRole("button", { name: /navigation menu/ });
  }
}
