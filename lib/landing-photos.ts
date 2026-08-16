export const LANDING_PHOTO_SLOTS = [
  {
    id: "hero",
    label: "Hero",
    description: "The large photo at the top of the home page, behind the search bar.",
    defaultSrc: "/photos/kitchen-navy-island.png",
    alt: "Navy kitchen island with leather stools and glass pendants, shot by Tyler for Move Media",
  },
  {
    id: "agent",
    label: "Buying & selling",
    description: "Wide photo in the “Buying & selling with Tyler” section.",
    defaultSrc: "/photos/living-blue-velvet.png",
    alt: "Staged living room with blue velvet chairs and leather sectional, shot by Move Media",
  },
  {
    id: "selling",
    label: "Thinking of selling",
    description: "Smaller photo on the “Thinking of selling?” card.",
    defaultSrc: "/photos/accepted-offer.png",
    alt: "Tyler Oxford in front of a sold home — accepted offer social graphic",
  },
  {
    id: "studio",
    label: "Move Media studio",
    description: "Photo on the studio / book-a-shoot card.",
    defaultSrc: "/photos/media-room-navy.png",
    alt: "Navy media room with panelled accent wall, shot by Move Media",
  },
  {
    id: "about",
    label: "About",
    description: "Photo beside the “One brand, two doors” story.",
    defaultSrc: "/photos/kitchen-white-quartz.png",
    alt: "Bright white kitchen with waterfall quartz island, shot by Move Media",
  },
  {
    id: "faq",
    label: "FAQs",
    description: "Photo under the FAQ intro on desktop.",
    defaultSrc: "/photos/sunroom-red-chairs.png",
    alt: "Sunroom with red womb chairs, shot by Move Media",
  },
  {
    id: "cta",
    label: "Bottom banner",
    description: "Full-width photo behind “Find your next home, stress-free”.",
    defaultSrc: "/photos/living-leather-sofas.png",
    alt: "Living room with leather sofas and ocean art, shot by Move Media",
  },
] as const;

export type LandingPhotoSlotId = (typeof LANDING_PHOTO_SLOTS)[number]["id"];

export type LandingPhotoMap = Record<LandingPhotoSlotId, string>;

export type LandingPhotoRow = {
  slot: string;
  url: string;
};

export const SITE_PHOTO_LIBRARY: { src: string; label: string }[] = [
  { src: "/photos/accepted-offer.png", label: "Accepted offer" },
  { src: "/photos/bathroom-maple.png", label: "Maple bathroom" },
  { src: "/photos/bedroom-blue-accent.png", label: "Blue accent bedroom" },
  { src: "/photos/bedroom-floral-primary.png", label: "Floral primary bedroom" },
  { src: "/photos/den-yellow-sofa.png", label: "Den with yellow sofa" },
  { src: "/photos/dining-minimal.png", label: "Minimal dining" },
  { src: "/photos/dining-modern.png", label: "Modern dining" },
  { src: "/photos/exterior-farmhouse.png", label: "Farmhouse exterior" },
  { src: "/photos/family-room-navy-wainscot.png", label: "Navy wainscot family room" },
  { src: "/photos/foyer-checkered.png", label: "Checkered foyer" },
  { src: "/photos/kitchen-maple-red-ceiling.png", label: "Maple kitchen, red ceiling" },
  { src: "/photos/kitchen-navy-island.png", label: "Navy kitchen island" },
  { src: "/photos/kitchen-red-accent.png", label: "Red accent kitchen" },
  { src: "/photos/kitchen-white-quartz.png", label: "White quartz kitchen" },
  { src: "/photos/living-blue-velvet.png", label: "Blue velvet living room" },
  { src: "/photos/living-leather-sofas.png", label: "Leather sofas living room" },
  { src: "/photos/living-tan-sectional.png", label: "Tan sectional living room" },
  { src: "/photos/media-room-navy.png", label: "Navy media room" },
  { src: "/photos/sitting-room-grey.png", label: "Grey sitting room" },
  { src: "/photos/sunroom-red-chairs.png", label: "Sunroom with red chairs" },
];

export function isLandingPhotoSlot(value: string): value is LandingPhotoSlotId {
  return LANDING_PHOTO_SLOTS.some((slot) => slot.id === value);
}

export function defaultLandingPhotos(): LandingPhotoMap {
  return Object.fromEntries(LANDING_PHOTO_SLOTS.map((slot) => [slot.id, slot.defaultSrc])) as LandingPhotoMap;
}

export function landingPhotoSlot(id: LandingPhotoSlotId) {
  const slot = LANDING_PHOTO_SLOTS.find((item) => item.id === id);
  if (!slot) throw new Error(`Unknown landing photo slot: ${id}`);
  return slot;
}

export function isAllowedLandingPhotoUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/photos/") && !trimmed.includes("..") && !trimmed.includes("\\")) {
    return trimmed.length < 200;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".supabase.co");
  } catch {
    return false;
  }
}

export function mergeLandingPhotos(rows: LandingPhotoRow[] | null | undefined): LandingPhotoMap {
  const photos = defaultLandingPhotos();
  for (const row of rows || []) {
    if (!isLandingPhotoSlot(row.slot)) continue;
    const url = (row.url || "").trim();
    if (!isAllowedLandingPhotoUrl(url)) continue;
    photos[row.slot] = url;
  }
  return photos;
}

export function isCustomLandingPhoto(slot: LandingPhotoSlotId, url: string): boolean {
  return url !== landingPhotoSlot(slot).defaultSrc;
}

export function landingUploadPath(slot: LandingPhotoSlotId, fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const stamp =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${slot}-${fileName.length}`;
  return `landing/${slot}-${stamp}.${ext}`;
}
