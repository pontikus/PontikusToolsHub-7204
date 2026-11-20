// Edit names, promises and statuses here. The hub reads this one catalogue.
import type { ToolType } from "./levels";
export type ToolStatus = "Live" | "In build" | "Planned";
export const audiences: Record<string, string> = {
  "sea-lovers": "Sea Lovers",
  "coastal-experts": "Coastal Experts",
  "shoreline-businesses": "Shoreline Businesses",
};
export const tools: {
  number: number;
  name: string;
  slug: string;
  promise: string;
  status: ToolStatus;
  audience: string;
  // Levelled tools only: their type and the level built so far.
  toolType?: ToolType;
  level?: "Starter";
}[] = [
  {
    number: 1,
    name: "Postcard Maker",
    slug: "postcard",
    promise: "A little piece of the coast, sent your way.",
    status: "Live",
    audience: "sea-lovers",
  },
  {
    number: 2,
    name: "Passport Page Builder",
    slug: "passport",
    promise: "Turn the places you’ve been into a page to keep.",
    status: "Live",
    audience: "sea-lovers",
  },
  {
    number: 3,
    name: "Trip Journal",
    slug: "journal",
    promise: "Keep the moments the camera might miss.",
    status: "Live",
    audience: "sea-lovers",
  },
  {
    number: 4,
    name: "Photo Frame Maker",
    slug: "photo-frame",
    promise: "Give your coastal photographs a considered frame.",
    status: "Live",
    audience: "sea-lovers",
  },
  {
    number: 5,
    name: "Media Kit Builder",
    slug: "media-kit",
    promise: "Introduce your expertise on one polished page.",
    status: "Live",
    audience: "coastal-experts",
  },
  {
    number: 6,
    name: "Rate Card Builder",
    slug: "rate-card",
    promise: "Make your services and prices clear at a glance.",
    status: "Live",
    audience: "coastal-experts",
  },
  {
    number: 7,
    name: "Credential Card Maker",
    slug: "credential-card",
    promise: "Your experience, in a card-sized introduction.",
    status: "Live",
    audience: "coastal-experts",
  },
  {
    number: 8,
    name: "Availability Poster Maker",
    slug: "availability",
    promise: "Let the coast know where and when to find you.",
    status: "Live",
    audience: "coastal-experts",
  },
  {
    number: 9,
    name: "Review Poster Maker",
    slug: "review-poster",
    promise: "Turn a good visit into a lasting recommendation.",
    status: "Live",
    audience: "shoreline-businesses",
  },
  {
    number: 10,
    name: "Event Flyer Maker",
    slug: "event-flyer",
    promise: "Bring your next coastal gathering into view.",
    status: "Live",
    audience: "shoreline-businesses",
  },
  {
    number: 11,
    name: "Offer Board Maker",
    slug: "offer-board",
    promise: "Put your latest offers where they’ll be noticed.",
    status: "Live",
    audience: "shoreline-businesses",
  },
  {
    number: 12,
    name: "Job Post Maker",
    slug: "job-post",
    promise: "Find the right people for your place on the coast.",
    status: "Live",
    audience: "shoreline-businesses",
  },
  {
    number: 13,
    name: "Harbour Notice Maker",
    slug: "notice",
    promise: "Keep your community clearly in the picture.",
    status: "Live",
    audience: "shoreline-businesses",
  },
  {
    number: 14,
    name: "Social Post Kit",
    slug: "social-kit",
    promise: "Three matching sizes. One unmistakable business.",
    status: "Live",
    audience: "shoreline-businesses",
  },
  // Levelled tools: Starter versions. Levels 1–3 follow the membership tiers.
  {
    number: 15,
    name: "Trip Readiness Wheel",
    slug: "trip-readiness-wheel",
    promise: "Find the weak spot in your trip before the sea does.",
    status: "Live",
    audience: "sea-lovers",
    toolType: "Assessment",
    level: "Starter",
  },
  {
    number: 16,
    name: "Sea Swim Kit Checker",
    slug: "sea-swim-kit-checker",
    promise: "Everything for your next swim, ticked off before you go.",
    status: "Live",
    audience: "sea-lovers",
    toolType: "Checker",
    level: "Starter",
  },
  {
    number: 17,
    name: "Profile Strength Checker",
    slug: "profile-strength-checker",
    promise: "Five questions, a score and the three fixes that matter most.",
    status: "Live",
    audience: "coastal-experts",
    toolType: "Assessment",
    level: "Starter",
  },
  {
    number: 18,
    name: "Occupancy Gap Finder",
    slug: "occupancy-gap-finder",
    promise: "See what empty rooms cost you, month by month.",
    status: "Live",
    audience: "shoreline-businesses",
    toolType: "Calculator",
    level: "Starter",
  },
  {
    number: 19,
    name: "Season Readiness Wheel",
    slug: "season-readiness-wheel",
    promise: "Know which part of the business to fix before the season turns.",
    status: "Live",
    audience: "shoreline-businesses",
    toolType: "Assessment",
    level: "Starter",
  },
];

// These URLs were supplied by Pontikus. Preserve the Western Asia URL spelling.
export const regions = [
  "Eastern Africa",
  "Middle Africa",
  "Northern Africa",
  "Southern Africa",
  "Western Africa",
  "Central America",
  "North America",
  "South America",
  "The Caribbean",
  "East Asia",
  "Southeast Asia",
  "South Asia",
  "Oceania",
  "Western Asia",
  "Eastern Europe",
  "Northern Europe",
  "Southern Europe",
  "Western Europe",
];
let frameRemovalLocked = false;
export const settings = {
  verifyUrl: "[VERIFY URL]",
  suggestionUrl: "[SUGGESTION FORM URL]",
  // Change to true when profile verification is connected. No gating in this prototype.
  get gateFrameRemoval() {
    return frameRemovalLocked;
  },
  set gateFrameRemoval(locked: boolean) {
    frameRemovalLocked = locked;
    if (typeof window !== "undefined") window.dispatchEvent(new Event("pontikus-frame-gate"));
  },
};
