import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest runs without globals, so @testing-library/react cannot register its
// automatic afterEach cleanup; without it, DOM leaks between tests.
afterEach(() => {
  cleanup();
});
