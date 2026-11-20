// Registry of the Starter widgets, keyed by catalogue slug.
import type { Mount } from "./core";
import { mount as tripReadinessWheel } from "./trip-readiness-wheel";
import { mount as seaSwimKitChecker } from "./sea-swim-kit-checker";
import { mount as occupancyGapFinder } from "./occupancy-gap-finder";
import { mount as seasonReadinessWheel } from "./season-readiness-wheel";
import { mount as profileStrengthChecker } from "./profile-strength-checker";
import { mount as swellWindowPlanner } from "./swell-window-planner";
import { mount as boardFitShortlist } from "./board-fit-shortlist";
import { mount as coldWaterSwimLog } from "./cold-water-swim-log";
import { mount as paddleTurnaroundPlanner } from "./paddle-turnaround-planner";
import { mount as paddleKitChecker } from "./paddle-kit-checker";
import { mount as goldenHourShotPlanner } from "./golden-hour-shot-planner";
import { mount as coastalShootKitChecker } from "./coastal-shoot-kit-checker";
import { mount as diveDayPlanBuilder } from "./dive-day-plan-builder";
import { mount as snorkelSpotScorecard } from "./snorkel-spot-scorecard";
import { mount as coastalOvernightBudgetCalculator } from "./coastal-overnight-budget-calculator";
import { mount as vanLifeEssentialsChecker } from "./van-life-essentials-checker";
import { mount as beachCleanPlanner } from "./beach-clean-planner";
import { mount as impactLog } from "./impact-log";

export const widgets: Record<string, Mount> = {
  "trip-readiness-wheel": tripReadinessWheel,
  "sea-swim-kit-checker": seaSwimKitChecker,
  "occupancy-gap-finder": occupancyGapFinder,
  "season-readiness-wheel": seasonReadinessWheel,
  "profile-strength-checker": profileStrengthChecker,
  "swell-window-planner": swellWindowPlanner,
  "board-fit-shortlist": boardFitShortlist,
  "cold-water-swim-log": coldWaterSwimLog,
  "paddle-turnaround-planner": paddleTurnaroundPlanner,
  "paddle-kit-checker": paddleKitChecker,
  "golden-hour-shot-planner": goldenHourShotPlanner,
  "coastal-shoot-kit-checker": coastalShootKitChecker,
  "dive-day-plan-builder": diveDayPlanBuilder,
  "snorkel-spot-scorecard": snorkelSpotScorecard,
  "coastal-overnight-budget-calculator": coastalOvernightBudgetCalculator,
  "van-life-essentials-checker": vanLifeEssentialsChecker,
  "beach-clean-planner": beachCleanPlanner,
  "impact-log": impactLog,
};
