import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Unit tests live next to the code; Playwright specs under tests/ are
    // collected by Vitest's default include pattern and must be excluded.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
