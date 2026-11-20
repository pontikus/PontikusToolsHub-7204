import { describe, expect, test } from "bun:test";
import {
  clampScore,
  occupancyGaps,
  profileItems,
  profileStrength,
  scoreWheel,
  seaSwimChecklist,
  seasonAreas,
  tripAreas,
} from "./starter-tools";

describe("Readiness wheels", () => {
  test("score is the average on a 0–100 scale", () => {
    expect(scoreWheel(tripAreas, { route: 10, weather: 10, kit: 10, safety: 10 }).score).toBe(100);
    expect(scoreWheel(tripAreas, { route: 5, weather: 6, kit: 7, safety: 8 }).score).toBe(65);
  });
  test("weakest is the lowest score, ties go to the first area", () => {
    expect(scoreWheel(tripAreas, { route: 8, weather: 3, kit: 9, safety: 3 }).weakest.key).toBe("weather");
    expect(scoreWheel(seasonAreas, { staffing: 4, stock: 4, bookings: 4, cash: 4 }).weakest.key).toBe("staffing");
  });
  test("bands and clamping", () => {
    expect(scoreWheel(tripAreas, { route: 4, weather: 4, kit: 4, safety: 4 }).band).toBe("low");
    expect(scoreWheel(tripAreas, { route: 7, weather: 7, kit: 7, safety: 7 }).band).toBe("mid");
    expect(scoreWheel(tripAreas, { route: 8, weather: 8, kit: 7, safety: 8 }).band).toBe("high");
    expect(clampScore(0)).toBe(1);
    expect(clampScore(42)).toBe(10);
    expect(clampScore(Number.NaN)).toBe(1);
  });
  test("starter wheels have four areas, none about boat maintenance", () => {
    expect(tripAreas).toHaveLength(4);
    expect(seasonAreas).toHaveLength(4);
    expect(tripAreas.some((a) => /engine|hull|boat/i.test(a.label + a.question))).toBe(false);
  });
});

describe("Sea Swim Kit Checker", () => {
  test("every list has the safety basics", () => {
    const ids = seaSwimChecklist("dip", "buddy", "calm").map((i) => i.id);
    for (const id of ["hat", "float", "tide", "exit", "towel"]) expect(ids).toContain(id);
  });
  test("answers change the list", () => {
    const alone = seaSwimChecklist("remote", "alone", "cold").map((i) => i.id);
    for (const id of ["tell", "phone", "location", "neoprene", "short"]) expect(alone).toContain(id);
    expect(seaSwimChecklist("dip", "group", "calm").map((i) => i.id)).toContain("count");
    expect(seaSwimChecklist("dip", "buddy", "choppy").map((i) => i.id)).toContain("goggles");
  });
  test("no duplicate items", () => {
    const ids = seaSwimChecklist("distance", "alone", "choppy").map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("Occupancy Gap Finder", () => {
  const base = { rooms: 10, rate: 100, target: 70, occupancy: Array(12).fill(70) };
  test("no gaps when every month meets target", () => {
    const r = occupancyGaps(base);
    expect(r.gapMonths).toBe(0);
    expect(r.totalLostRevenue).toBe(0);
    expect(r.worst).toBeNull();
  });
  test("lost nights and revenue per month", () => {
    const occupancy = [...base.occupancy];
    occupancy[0] = 50; // January, 31 days, 20 points below target
    const r = occupancyGaps({ ...base, occupancy });
    expect(r.rows[0].lostNights).toBe(62); // 10 × 31 × 0.2
    expect(r.rows[0].lostRevenue).toBe(6200);
    expect(r.worst?.month).toBe("Jan");
    expect(r.gapMonths).toBe(1);
  });
  test("bad input is clamped, not propagated", () => {
    const r = occupancyGaps({ rooms: -5, rate: Number.NaN, target: 150, occupancy: [200, -10] });
    expect(r.totalLostRevenue).toBe(0);
    expect(Number.isFinite(r.totalLostNights)).toBe(true);
  });
});

describe("Profile Strength Checker", () => {
  test("score and top three fixes in priority order", () => {
    expect(profileStrength({}).score).toBe(0);
    expect(profileStrength({}).fixes.map((f) => f.key)).toEqual(["services", "proof", "reviews"]);
    const all = Object.fromEntries(profileItems.map((i) => [i.key, true]));
    expect(profileStrength(all)).toMatchObject({ score: 100, fixes: [] });
    expect(profileStrength({ services: true, proof: true }).fixes.map((f) => f.key)).toEqual(["reviews", "contact", "photo"]);
  });
});

import { rankAreas, tipFor, tripAreasFull, tripTips } from "./starter-tools";
import { unlockedLevel } from "./levels";

describe("Trip Readiness Wheel Level 1", () => {
  test("eight areas, each with three tips", () => {
    expect(tripAreasFull).toHaveLength(8);
    for (const a of tripAreasFull) expect(Object.keys(tripTips[a.key])).toEqual(["low", "mid", "high"]);
  });
  test("tip follows the score band", () => {
    expect(tipFor(tripTips, "route", 2)).toBe(tripTips.route.low);
    expect(tipFor(tripTips, "route", 6)).toBe(tripTips.route.mid);
    expect(tipFor(tripTips, "route", 9)).toBe(tripTips.route.high);
  });
  test("areas rank weakest first, ties in wheel order", () => {
    const scores = Object.fromEntries(tripAreasFull.map((a) => [a.key, 7]));
    scores.food = 3;
    scores.planb = 3;
    const ranked = rankAreas(tripAreasFull, scores, tripTips);
    expect(ranked.slice(0, 2).map((r) => r.area.key)).toEqual(["food", "planb"]);
    expect(ranked[0].tip).toBe(tripTips.food.low);
  });
  test("only a matching paid plan unlocks Level 1", () => {
    const built = ["starter", "level1"] as const;
    expect(unlockedLevel("sea-lovers", "level1", "sea-lovers", [...built])).toBe("level1");
    expect(unlockedLevel("sea-lovers", "level3", "sea-lovers", [...built])).toBe("level1");
    expect(unlockedLevel("sea-lovers", "starter", "sea-lovers", [...built])).toBe("starter");
    expect(unlockedLevel("coastal-experts", "level2", "sea-lovers", [...built])).toBe("starter");
    expect(unlockedLevel(undefined, undefined, "sea-lovers", [...built])).toBe("starter");
  });
});
