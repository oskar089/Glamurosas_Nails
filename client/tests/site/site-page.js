import { BasePage } from "../base-page";

export class SitePage extends BasePage {
  constructor(page) {
    super(page);
    this.navigation = page.getByRole("navigation", {
      name: "Navegación principal",
      exact: true,
    });
    this.menu = page.getByRole("button", { name: /menú de navegación/ });
  }
}
