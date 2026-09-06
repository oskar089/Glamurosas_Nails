import { test } from "@playwright/test";

export class BasePage {
  constructor(page) {
    this.page = page;
    this.main = page.getByRole("main");
  }

  async goto(path) {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
  }

  async blockExternalAssets() {
    const applicationOrigin = new URL(test.info().project.use.baseURL).origin;
    await this.page.route("**/*", (route) => {
      return new URL(route.request().url()).origin === applicationOrigin
        ? route.continue()
        : route.abort();
    });
  }
}
