import { describe, expect, it } from "vitest";
import {
  defaultLandingPhotos,
  isAllowedLandingPhotoUrl,
  isCustomLandingPhoto,
  isLandingPhotoSlot,
  landingUploadPath,
  mergeLandingPhotos,
} from "./landing-photos";

describe("landing photos", () => {
  it("starts from the bundled section defaults", () => {
    expect(defaultLandingPhotos()).toMatchObject({
      hero: "/photos/kitchen-navy-island.png",
      faq: "/photos/sunroom-red-chairs.png",
    });
  });

  it("applies known overrides and ignores junk", () => {
    const photos = mergeLandingPhotos([
      { slot: "hero", url: "https://moqhrfdqwpvucxoemcrg.supabase.co/storage/v1/object/public/listing-photos/landing/hero.jpg" },
      { slot: "not-a-slot", url: "/photos/dining-modern.png" },
      { slot: "faq", url: "  " },
      { slot: "cta", url: "javascript:alert(1)" },
      { slot: "about", url: "/photos/../secret.png" },
      { slot: "studio", url: "/photos/media-room-navy.png" },
    ]);

    expect(photos.hero).toContain("supabase.co");
    expect(photos.faq).toBe("/photos/sunroom-red-chairs.png");
    expect(photos.cta).toBe("/photos/living-leather-sofas.png");
    expect(photos.about).toBe("/photos/kitchen-white-quartz.png");
    expect(photos.studio).toBe("/photos/media-room-navy.png");
  });

  it("treats a missing or failed query as the defaults", () => {
    expect(mergeLandingPhotos(null)).toEqual(defaultLandingPhotos());
    expect(mergeLandingPhotos(undefined)).toEqual(defaultLandingPhotos());
  });

  it("builds a landing upload path under the landing/ prefix", () => {
    expect(landingUploadPath("hero", "Kitchen Shot.JPG")).toMatch(/^landing\/hero-.+\.jpg$/);
  });

  it("validates slot ids and photo URLs", () => {
    expect(isLandingPhotoSlot("hero")).toBe(true);
    expect(isLandingPhotoSlot("footer")).toBe(false);
    expect(isAllowedLandingPhotoUrl("/photos/kitchen-navy-island.png")).toBe(true);
    expect(isAllowedLandingPhotoUrl("https://evil.example/photo.jpg")).toBe(false);
    expect(isCustomLandingPhoto("hero", "/photos/dining-modern.png")).toBe(true);
    expect(isCustomLandingPhoto("hero", "/photos/kitchen-navy-island.png")).toBe(false);
  });
});
