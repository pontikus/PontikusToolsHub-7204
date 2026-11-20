import { describe, expect, test } from "bun:test";
import {
  beachCleanPlan,
  boardShortlist,
  buildChecklist,
  divePlanText,
  duration,
  impactSummary,
  overnightBudget,
  paddleTurnaround,
  rankSpots,
  shotPlan,
  swellWindows,
  swimLogSummary,
  toClock,
  toMinutes,
} from "./sea-lovers-tools";

describe("time helpers", () => {
  test("parse and format clock times", () => {
    expect(toMinutes("07:30")).toBe(450);
    expect(toMinutes("24:00")).toBeNull();
    expect(toMinutes("nonsense")).toBeNull();
    expect(toClock(450)).toBe("07:30");
    expect(toClock(-30)).toBe("23:30");
    expect(duration(95)).toBe("1 h 35 min");
    expect(duration(20)).toBe("20 min");
  });
});

describe("buildChecklist", () => {
  test("applies rules, drops duplicates and orders by group", () => {
    const rules = [
      { items: [{ id: "a", text: "A", group: "Safety" }] },
      { when: (s: { cold: boolean }) => s.cold, items: [{ id: "b", text: "B", group: "Kit" }, { id: "a", text: "A again", group: "Kit" }] },
    ];
    expect(buildChecklist(rules, { cold: false }, ["Kit", "Safety"]).map((i) => i.id)).toEqual(["a"]);
    const cold = buildChecklist(rules, { cold: true }, ["Kit", "Safety"]);
    expect(cold.map((i) => i.id)).toEqual(["b", "a"]);
    expect(cold.find((i) => i.id === "a")!.text).toBe("A");
  });
});

describe("swellWindows", () => {
  test("keeps overlaps of 30 minutes or more, best first", () => {
    const w = swellWindows([
      { day: "Sat", freeFrom: "06:00", freeTo: "12:00", goodFrom: "07:00", goodTo: "09:00", quality: 2 },
      { day: "Sun", freeFrom: "10:00", freeTo: "12:00", goodFrom: "11:45", goodTo: "14:00", quality: 3 },
      { day: "Mon", freeFrom: "17:00", freeTo: "20:00", goodFrom: "16:00", goodTo: "19:00", quality: 3 },
    ]);
    expect(w.map((x) => x.day)).toEqual(["Mon", "Sat"]);
    expect(w[0]).toMatchObject({ start: 1020, end: 1140, minutes: 120, score: 360 });
  });
  test("ignores rows with bad times", () => {
    expect(swellWindows([{ day: "Sat", freeFrom: "", freeTo: "12:00", goodFrom: "07:00", goodTo: "09:00", quality: 2 }])).toEqual([]);
  });
});

describe("boardShortlist", () => {
  test("gives a volume range and types for the level and wave", () => {
    const r = boardShortlist(80, "improving", "average");
    expect(r).toMatchObject({ litresFrom: 40, litresTo: 50 });
    expect(r.types.length).toBeGreaterThan(0);
    expect(boardShortlist(80, "improving", "small").litresFrom).toBeGreaterThan(40);
    expect(boardShortlist(80, "new", "average").litresFrom).toBeGreaterThan(r.litresTo);
  });
});

describe("trackers", () => {
  test("swim log summary finds coldest, longest and the trend", () => {
    expect(swimLogSummary([])).toBeNull();
    const s = swimLogSummary([
      { date: "2026-10-01", tempC: 14, minutes: 10, feel: 3 },
      { date: "2026-10-08", tempC: 13, minutes: 11, feel: 3 },
      { date: "2026-10-15", tempC: 12, minutes: 15, feel: 4 },
      { date: "2026-10-22", tempC: 11, minutes: 16, feel: 4 },
    ])!;
    expect(s.count).toBe(4);
    expect(s.coldest.tempC).toBe(11);
    expect(s.longest.minutes).toBe(16);
    expect(s.trend).toBe("up");
  });
  test("impact summary adds up bags, weight and volunteer hours", () => {
    expect(
      impactSummary([
        { date: "2026-10-01", bags: 4, kg: 12.5, volunteers: 6, hours: 2 },
        { date: "2026-10-20", bags: 2, kg: 3, volunteers: 3, hours: 1.5 },
      ]),
    ).toEqual({ events: 2, bags: 6, kg: 15.5, people: 9, volunteerHours: 16.5 });
  });
});

describe("paddleTurnaround", () => {
  test("fits the whole route when there is time", () => {
    const r = paddleTurnaround({ distanceKm: 4, paceKmh: 6, start: "09:00", backBy: "12:00", back: "none" })!;
    expect(r.fits).toBe(true);
    expect(r.reserve).toBe(36);
    expect(Math.round(r.turnAt)).toBe(580);
  });
  test("finds the furthest safe point when it does not fit", () => {
    const r = paddleTurnaround({ distanceKm: 10, paceKmh: 6, start: "09:00", backBy: "11:00", back: "against" })!;
    expect(r.fits).toBe(false);
    expect(r.homeAt - 540).toBeCloseTo(96, 5); // 80% of 120 minutes
    expect(r.turnKm).toBeLessThan(10);
  });
  test("rejects a finish before the start", () => {
    expect(paddleTurnaround({ distanceKm: 4, paceKmh: 6, start: "12:00", backBy: "09:00", back: "none" })).toBeNull();
  });
});

describe("shotPlan", () => {
  test("evening plan works back from sunset", () => {
    const p = shotPlan({ session: "evening", sunTime: "19:00", travelMin: 30, setupMin: 15, lowTide: "18:30" })!;
    expect(p.windows[0]).toMatchObject({ name: "Golden hour", from: 1080, to: 1140 });
    expect(p.arrive).toBe(1065);
    expect(p.leave).toBe(1035);
    expect(p.tideNote).toContain("within an hour");
  });
  test("morning plan starts at blue hour", () => {
    const p = shotPlan({ session: "morning", sunTime: "06:30", travelMin: 20, setupMin: 10 })!;
    expect(p.windows[0].name).toBe("Blue hour");
    expect(p.leave).toBe(390 - 30 - 30);
    expect(p.tideNote).toBe("");
  });
});

describe("rankSpots", () => {
  test("ranks named spots and names the weakest factor", () => {
    const r = rankSpots([
      { name: "Cove", access: 8, conditions: 4, confidence: 9 },
      { name: "", access: 10, conditions: 10, confidence: 10 },
      { name: "Reef", access: 7, conditions: 8, confidence: 8 },
    ]);
    expect(r.map((s) => s.name)).toEqual(["Reef", "Cove"]);
    expect(r[1].concern).toBe("Conditions");
    expect(r[0].total).toBe(77);
  });
});

describe("overnightBudget", () => {
  test("adds pitch, fuel and food", () => {
    const b = overnightBudget({ nights: 2, people: 2, pitchPerNight: 25, distanceKm: 200, litresPer100: 8, fuelPrice: 1.5, foodPerPersonDay: 15 });
    expect(b).toMatchObject({ pitch: 50, fuel: 24, food: 90, total: 164, perNight: 82, perPerson: 82 });
  });
});

describe("beachCleanPlan", () => {
  test("sizes kit to the group and lists what is missing", () => {
    const p = beachCleanPlan({ start: "10:00", hours: 2, volunteers: 12, have: ["gloves", "bags"] });
    expect(p.kit.find((k) => k.key === "pickers")!.qty).toBe(6);
    expect(p.missing.map((k) => k.key)).toEqual(["pickers", "firstaid", "hivis", "sharps"]);
    expect(p.timeline[0].at).toBe(570);
    expect(p.timeline[p.timeline.length - 1].at).toBe(720);
    expect(p.roles.find((r) => r.role === "Team leads")!.count).toBe(1);
  });
});

describe("divePlanText", () => {
  test("includes the out-by time and the freediving rule", () => {
    const text = divePlanText({ spot: "North Reef", date: "2026-11-21", entry: "10:00", maxDepth: 8, minutes: 45, buddy: "Sam", buddyPhone: "", shoreContact: "Alex", freedive: true });
    expect(text).toContain("Out by: 10:45");
    expect(text).toContain("One up, one down");
    expect(text).not.toContain("(");
  });
});
