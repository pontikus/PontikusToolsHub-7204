import { tripAreas, tripAreasLevel1 } from "../web/lib/starter-tools";
import { readinessWheel } from "./readiness-wheel";

export const mount = readinessWheel({
  audience: "sea-lovers",
  audienceName: "Sea Lovers",
  intro:
    "Score four parts of your next trip to the coast. You get an overall readiness score and the one area to fix before you set off.",
  areas: tripAreas,
  level1Areas: [...tripAreas.map((a) => a.label), ...tripAreasLevel1],
  bands: { low: "Not ready yet", mid: "Nearly there", high: "Ready to go" },
  // Boat upkeep is covered by the live Boatcare Readiness Check, so the wheel leaves it out.
  extraNote: () =>
    'Taking your own boat? Run the <a class="pkst-link" href="https://pontikus.com/calculators/boatcare-readiness-check">Boatcare Readiness Check</a> for the engine, hull and safety gear. For the best month to go, try the <a class="pkst-link" href="https://pontikus.com/boatyard/coastal-season-planner">Coastal Season Planner</a>.',
});
