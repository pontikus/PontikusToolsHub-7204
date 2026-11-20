import { seasonAreas, seasonAreasLevel1 } from "../web/lib/starter-tools";
import { readinessWheel } from "./readiness-wheel";

export const mount = readinessWheel({
  audience: "shoreline-businesses",
  audienceName: "Shoreline Businesses",
  intro:
    "Score four parts of your business before the next busy or quiet season. You get an overall score and the area to fix first.",
  areas: seasonAreas,
  level1Areas: seasonAreasLevel1,
  bands: { low: "Exposed", mid: "Holding up", high: "Season ready" },
  // The Seaworthiness Ladder scores resilience (infrastructure, safety, compliance, risk);
  // this wheel stays on day-to-day season operations and points there for the rest.
  extraNote: () =>
    'For a resilience score across infrastructure, safety, compliance and risk, play the <a class="pkst-link" href="https://pontikus.com/seaworthiness-ladder">Seaworthiness Ladder</a>. Planning for a quiet season? The <a class="pkst-link" href="https://pontikus.com/calculators/off-season-break-even-calculator">Off-Season Break-Even Calculator</a> sizes the gap.',
});
