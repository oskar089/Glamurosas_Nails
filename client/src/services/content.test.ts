import { describe, expect, it } from "vitest";
import { CATEGORY_IDS, SERVICE_IDS } from "../models/types";
import {
  categories,
  demoTimes,
  exampleReviews,
  isCategoryId,
  isServiceId,
  localDateString,
  photos,
  services,
} from "./content";

function allUnique(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

describe("isServiceId", () => {
  it("accepts every known service id", () => {
    for (const id of SERVICE_IDS) {
      expect(isServiceId(id)).toBe(true);
    }
  });

  it("rejects unknown, empty and null values", () => {
    for (const value of ["unknown", "", null]) {
      expect(isServiceId(value)).toBe(false);
    }
  });
});

describe("isCategoryId", () => {
  it("accepts every known category id", () => {
    for (const id of CATEGORY_IDS) {
      expect(isCategoryId(id)).toBe(true);
    }
  });

  it("rejects unknown, empty and null values", () => {
    for (const value of ["unknown", "", null]) {
      expect(isCategoryId(value)).toBe(false);
    }
  });
});

describe("localDateString", () => {
  it("uses local calendar parts with zero-padded month and day", () => {
    expect(localDateString(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(localDateString(new Date(2026, 11, 31))).toBe("2026-12-31");
  });

  it("keeps the local day, not the UTC day, near the day boundary", () => {
    // Late local evening can already be the next day in UTC; the helper must
    // report the local day regardless of the machine timezone.
    expect(localDateString(new Date(2026, 8, 7, 23, 30))).toBe("2026-09-07");
  });

  it("formats the current day as a YYYY-MM-DD string by default", () => {
    expect(localDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("services data", () => {
  it("has four services with unique, typed ids", () => {
    expect(services).toHaveLength(4);
    expect(allUnique(services.map((service) => service.id))).toBe(true);
    for (const service of services) {
      expect(SERVICE_IDS).toContain(service.id);
    }
  });

  it("has complete non-blank copy fields and positive pricing", () => {
    for (const service of services) {
      expect(service.name.trim()).not.toBe("");
      expect(service.shortName.trim()).not.toBe("");
      expect(service.description.trim()).not.toBe("");
      expect(service.note.trim()).not.toBe("");
      expect(service.price).toBeGreaterThan(0);
      expect(service.duration).toBeGreaterThan(0);
    }
  });

  it("maps every service id to a category id", () => {
    for (const service of services) {
      expect(CATEGORY_IDS).toContain(service.id);
    }
  });
});

describe("categories data", () => {
  it("has five categories with unique, typed ids and labels", () => {
    expect(categories).toHaveLength(5);
    expect(allUnique(categories.map((category) => category.id))).toBe(true);
    for (const category of categories) {
      expect(CATEGORY_IDS).toContain(category.id);
      expect(category.label.trim()).not.toBe("");
    }
  });
});

describe("photos data", () => {
  it("has six photos with unique ids and non-blank fields", () => {
    expect(photos).toHaveLength(6);
    expect(allUnique(photos.map((photo) => photo.id))).toBe(true);
    for (const photo of photos) {
      expect(photo.image.trim()).not.toBe("");
      expect(photo.title.trim()).not.toBe("");
      expect(photo.alt.trim()).not.toBe("");
      expect(CATEGORY_IDS).toContain(photo.category);
      expect(photo.category).not.toBe("all");
    }
  });
});

describe("exampleReviews data", () => {
  it("has three unique example reviews with ratings 1..5", () => {
    expect(exampleReviews).toHaveLength(3);
    expect(allUnique(exampleReviews.map((review) => review.id))).toBe(true);
    for (const review of exampleReviews) {
      expect(review.rating).toBeGreaterThanOrEqual(1);
      expect(review.rating).toBeLessThanOrEqual(5);
      expect(review.name.trim()).not.toBe("");
      expect(review.comment.trim()).not.toBe("");
      expect(review.style.trim()).not.toBe("");
      expect(review.example).toBe(true);
    }
  });
});

describe("demoTimes data", () => {
  it("has six unique hours in HH:MM format", () => {
    expect(demoTimes).toHaveLength(6);
    expect(allUnique([...demoTimes])).toBe(true);
    for (const time of demoTimes) {
      expect(time).toMatch(/^\d{2}:\d{2}$/);
    }
  });
});
