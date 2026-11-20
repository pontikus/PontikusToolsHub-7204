// Registry of the Starter widgets, keyed by catalogue slug.
import type { Mount } from "./core";
import { mount as tripReadinessWheel } from "./trip-readiness-wheel";
import { mount as seaSwimKitChecker } from "./sea-swim-kit-checker";
import { mount as occupancyGapFinder } from "./occupancy-gap-finder";
import { mount as seasonReadinessWheel } from "./season-readiness-wheel";
import { mount as profileStrengthChecker } from "./profile-strength-checker";

export const widgets: Record<string, Mount> = {
  "trip-readiness-wheel": tripReadinessWheel,
  "sea-swim-kit-checker": seaSwimKitChecker,
  "occupancy-gap-finder": occupancyGapFinder,
  "season-readiness-wheel": seasonReadinessWheel,
  "profile-strength-checker": profileStrengthChecker,
};
