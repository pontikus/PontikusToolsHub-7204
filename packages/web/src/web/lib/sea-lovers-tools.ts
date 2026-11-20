// Logic for the Sea Lovers Starter tools (batch 2). Pure functions, no I/O, unit tested.
import { clampScore } from "./starter-tools";

export const num = (value: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min;
};

// "HH:MM" <-> minutes after midnight. Bad input reads as null.
export function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(hhmm).trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}
export function toClock(minutes: number) {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
export const duration = (minutes: number) => {
  const m = Math.max(0, Math.round(minutes));
  const h = Math.floor(m / 60);
  return h ? `${h} h ${String(m % 60).padStart(2, "0")} min` : `${m} min`;
};

// ---------- Checklist engine (kit checkers) ----------
export type CheckItem = { id: string; text: string; group: string };
type Rule<S> = { when?: (s: S) => boolean; items: CheckItem[] };
export function buildChecklist<S>(rules: Rule<S>[], state: S, groups: string[]) {
  const seen = new Set<string>();
  const out: CheckItem[] = [];
  for (const rule of rules) {
    if (rule.when && !rule.when(state)) continue;
    for (const item of rule.items) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      out.push(item);
    }
  }
  return out.sort((a, b) => groups.indexOf(a.group) - groups.indexOf(b.group));
}

// ---------- Swell Window Planner ----------
export type SwellDay = { day: string; freeFrom: string; freeTo: string; goodFrom: string; goodTo: string; quality: 1 | 2 | 3 };
export function swellWindows(days: SwellDay[]) {
  return days
    .map((d) => {
      const f0 = toMinutes(d.freeFrom), f1 = toMinutes(d.freeTo), g0 = toMinutes(d.goodFrom), g1 = toMinutes(d.goodTo);
      if (f0 == null || f1 == null || g0 == null || g1 == null) return null;
      const start = Math.max(f0, g0);
      const end = Math.min(f1, g1);
      const minutes = end - start;
      if (minutes < 30) return null; // too short to be worth paddling out
      const quality = Math.min(3, Math.max(1, Math.round(d.quality))) as 1 | 2 | 3;
      return { day: d.day, start, end, minutes, quality, score: minutes * quality };
    })
    .filter((w): w is NonNullable<typeof w> => w !== null)
    .sort((a, b) => b.score - a.score);
}

// ---------- Board Fit Shortlist ----------
export type SurfLevel = "new" | "improving" | "experienced";
export type WaveType = "small" | "average" | "powerful";
const volumeFactor: Record<SurfLevel, [number, number]> = {
  new: [0.85, 1.0],
  improving: [0.5, 0.62],
  experienced: [0.36, 0.42],
};
const waveShift: Record<WaveType, number> = { small: 0.05, average: 0, powerful: -0.03 };
const boardTypes: Record<SurfLevel, Record<WaveType, string[]>> = {
  new: {
    small: ["Soft-top longboard, 8 to 9 ft", "Mini-mal, 7 ft 6 to 8 ft"],
    average: ["Soft-top, 8 ft or longer", "Mini-mal, 7 ft 6 to 8 ft"],
    powerful: ["Soft-top, 8 ft or longer, and stick to the white water until you are ready"],
  },
  improving: {
    small: ["Mini-mal or funboard", "Fish", "Egg"],
    average: ["Funboard or mid-length", "Fish", "Hybrid shortboard with extra volume"],
    powerful: ["Mid-length", "Hybrid shortboard with extra volume"],
  },
  experienced: {
    small: ["Groveller", "Fish", "Twin fin"],
    average: ["Shortboard", "Hybrid"],
    powerful: ["Shortboard", "Step-up, a few inches longer than your usual board"],
  },
};
export function boardShortlist(weightKg: number, level: SurfLevel, wave: WaveType) {
  const w = num(weightKg, 30, 160);
  const [lo, hi] = volumeFactor[level];
  const shift = waveShift[wave];
  return {
    litresFrom: Math.round(w * (lo + shift)),
    litresTo: Math.round(w * (hi + shift)),
    types: boardTypes[level][wave],
  };
}

// ---------- Trackers (Cold Water Swim Log, Impact Log) ----------
export const STARTER_TRACKER_LIMIT = 10;

export type SwimEntry = { date: string; tempC: number; minutes: number; feel: number };
export function swimLogSummary(entries: SwimEntry[]) {
  const list = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (!list.length) return null;
  const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  const coldest = list.reduce((c, e) => (e.tempC < c.tempC ? e : c), list[0]);
  const longest = list.reduce((c, e) => (e.minutes > c.minutes ? e : c), list[0]);
  let trend: "up" | "down" | "steady" | null = null;
  if (list.length >= 4) {
    const half = Math.floor(list.length / 2);
    const first = avg(list.slice(0, half).map((e) => e.minutes));
    const last = avg(list.slice(-half).map((e) => e.minutes));
    trend = last > first * 1.1 ? "up" : last < first * 0.9 ? "down" : "steady";
  }
  return {
    count: list.length,
    avgMinutes: Math.round(avg(list.map((e) => e.minutes)) * 10) / 10,
    avgTemp: Math.round(avg(list.map((e) => e.tempC)) * 10) / 10,
    coldest,
    longest,
    trend,
  };
}

export type ImpactEntry = { date: string; bags: number; kg: number; volunteers: number; hours: number };
export function impactSummary(entries: ImpactEntry[]) {
  const sum = (f: (e: ImpactEntry) => number) => entries.reduce((s, e) => s + f(e), 0);
  return {
    events: entries.length,
    bags: sum((e) => num(e.bags)),
    kg: Math.round(sum((e) => num(e.kg)) * 10) / 10,
    people: sum((e) => num(e.volunteers)),
    volunteerHours: Math.round(sum((e) => num(e.volunteers) * num(e.hours)) * 10) / 10,
  };
}

// ---------- Paddle Turnaround Planner ----------
export type ReturnConditions = "helping" | "none" | "against";
const returnFactor: Record<ReturnConditions, number> = { helping: 1.15, none: 1, against: 0.7 };
export function paddleTurnaround(opts: { distanceKm: number; paceKmh: number; start: string; backBy: string; back: ReturnConditions }) {
  const start = toMinutes(opts.start);
  const backBy = toMinutes(opts.backBy);
  const d = num(opts.distanceKm, 0, 500);
  const v = num(opts.paceKmh, 0.5, 20);
  if (start == null || backBy == null || backBy <= start) return null;
  const vBack = v * returnFactor[opts.back];
  const available = backBy - start;
  const reserve = Math.round(available * 0.2); // keep a fifth of the time spare
  const usable = available - reserve;
  const outMin = (d / v) * 60;
  const backMin = (d / vBack) * 60;
  if (outMin + backMin <= usable) {
    return { fits: true, turnAt: start + outMin, turnKm: d, returnMinutes: backMin, homeAt: start + outMin + backMin, reserve };
  }
  // Furthest point you can reach and still get back inside the usable time.
  const x = usable / 60 / (1 / v + 1 / vBack);
  const out = (x / v) * 60;
  const ret = (x / vBack) * 60;
  return { fits: false, turnAt: start + out, turnKm: Math.round(x * 10) / 10, returnMinutes: ret, homeAt: start + out + ret, reserve };
}

// ---------- Golden Hour Shot Planner ----------
export function shotPlan(opts: { session: "morning" | "evening"; sunTime: string; travelMin: number; setupMin: number; lowTide?: string }) {
  const sun = toMinutes(opts.sunTime);
  if (sun == null) return null;
  const travel = num(opts.travelMin, 0, 600);
  const setup = num(opts.setupMin, 0, 240);
  const evening = opts.session === "evening";
  // Evening: golden hour is the hour before sunset, blue hour about 30 minutes after.
  // Morning: blue hour about 30 minutes before sunrise, golden hour the hour after.
  const windows = evening
    ? [{ name: "Golden hour", from: sun - 60, to: sun }, { name: "Blue hour", from: sun, to: sun + 30 }]
    : [{ name: "Blue hour", from: sun - 30, to: sun }, { name: "Golden hour", from: sun, to: sun + 60 }];
  const firstLight = windows[0].from;
  const arrive = firstLight - setup;
  const leave = arrive - travel;
  const low = opts.lowTide ? toMinutes(opts.lowTide) : null;
  let tideNote = "";
  if (low != null) {
    const gap = Math.min(...windows.map((w) => (low < w.from ? w.from - low : low > w.to ? low - w.to : 0)));
    tideNote =
      gap <= 60
        ? "Low tide falls within an hour of your light: expect rock pools, wet sand reflections and more beach to work with."
        : "Low tide is well away from your light, so plan for the beach at a higher tide and check your way back.";
  }
  return { leave, arrive, windows, tideNote, backup: evening ? "Tomorrow's sunrise" : "This evening's sunset" };
}

// ---------- Snorkel Spot Scorecard ----------
export type SpotRating = { name: string; access: number; conditions: number; confidence: number };
const factorLabel = { access: "Access", conditions: "Conditions", confidence: "Your confidence" } as const;
export function rankSpots(spots: SpotRating[]) {
  return spots
    .filter((s) => s.name.trim())
    .map((s, index) => {
      const scores = { access: clampScore(s.access), conditions: clampScore(s.conditions), confidence: clampScore(s.confidence) };
      const total = Math.round(((scores.access + scores.conditions + scores.confidence) / 3) * 10);
      const weakKey = (Object.keys(scores) as (keyof typeof scores)[]).reduce((a, b) => (scores[b] < scores[a] ? b : a));
      return { name: s.name.trim(), index, total, scores, concern: factorLabel[weakKey], concernKey: weakKey };
    })
    .sort((a, b) => b.total - a.total || a.index - b.index);
}

// ---------- Coastal Overnight Budget Calculator ----------
export function overnightBudget(o: {
  nights: number; people: number; pitchPerNight: number; distanceKm: number; litresPer100: number; fuelPrice: number; foodPerPersonDay: number;
}) {
  const nights = num(o.nights, 1, 365);
  const people = num(o.people, 1, 50);
  const pitch = num(o.pitchPerNight) * nights;
  const fuel = (num(o.distanceKm) * num(o.litresPer100, 0, 50)) / 100 * num(o.fuelPrice);
  const food = num(o.foodPerPersonDay) * people * (nights + 1); // you eat on the last day too
  const total = pitch + fuel + food;
  return { pitch, fuel, food, total, perNight: total / nights, perPerson: total / people };
}

// ---------- Beach Clean Planner ----------
export type CleanKit = "gloves" | "bags" | "pickers" | "firstaid" | "hivis" | "sharps";
export function beachCleanPlan(o: { start: string; hours: number; volunteers: number; have: CleanKit[] }) {
  const v = Math.round(num(o.volunteers, 1, 500));
  const hours = num(o.hours, 0.5, 8);
  const start = toMinutes(o.start) ?? 600;
  const need: { key: CleanKit; text: string; qty: number }[] = [
    { key: "gloves", text: "Pairs of gloves", qty: v },
    { key: "bags", text: "Rubbish bags (two per pair of helpers)", qty: Math.ceil(v / 2) * 2 },
    { key: "pickers", text: "Litter pickers (one per two helpers)", qty: Math.ceil(v / 2) },
    { key: "firstaid", text: "First aid kit", qty: 1 },
    { key: "hivis", text: "Hi-vis vests for the leads", qty: Math.max(2, Math.ceil(v / 10)) },
    { key: "sharps", text: "Sharps box for needles and glass", qty: 1 },
  ];
  const kit = need.map((n) => ({ ...n, have: o.have.includes(n.key) }));
  const roles = [
    { role: "Lead", count: 1, job: "Runs the briefing, keeps time and is the contact for the landowner." },
    { role: "Safety lead", count: 1, job: "Owns the first aid kit and sharps box, watches the tide and the water's edge." },
    { role: "Sign-in", count: 1, job: "Signs people in and out, shares the safety points as they arrive." },
    { role: "Recorder", count: v >= 15 ? 2 : 1, job: "Counts bags, weighs if you can, and notes the main item types." },
    { role: "Team leads", count: Math.max(0, Math.ceil(v / 10) - 1), job: "Look after a group of up to ten on one stretch of beach." },
  ].filter((r) => r.count > 0);
  const end = start + hours * 60;
  const timeline = [
    { at: start - 30, what: "Lead and safety lead arrive, set up sign-in and kit" },
    { at: start, what: "Sign-in opens" },
    { at: start + 15, what: "Safety briefing: sharps, tide, lifting, where to stop" },
    { at: start + 25, what: "Clean starts, in teams on set stretches" },
    { at: end - 30, what: "Last bags in, regroup at the meeting point" },
    { at: end - 20, what: "Count and weigh, note the main item types, group photo" },
    { at: end, what: "Finish, sign out, take bags to the agreed collection point" },
  ];
  return { roles, kit, missing: kit.filter((k) => !k.have), timeline };
}

// ---------- Dive Day Plan Builder ----------
export type DivePlan = {
  spot: string; date: string; entry: string; maxDepth: number; minutes: number; buddy: string; buddyPhone: string; shoreContact: string; freedive: boolean;
};
export function divePlanText(p: DivePlan) {
  const entry = toMinutes(p.entry);
  const outBy = entry != null ? toClock(entry + num(p.minutes, 5, 300)) : "agreed time";
  const lines = [
    `DIVE DAY PLAN · ${p.spot || "Spot to confirm"} · ${p.date || "Date to confirm"}`,
    ``,
    `In the water: ${p.entry || "time to confirm"}. Out by: ${outBy}.`,
    `Planned max depth: ${num(p.maxDepth, 0, 100)} m. Time in the water: ${num(p.minutes, 5, 300)} min.`,
    `Buddy: ${p.buddy || "name to confirm"}${p.buddyPhone ? ` (${p.buddyPhone})` : ""}.`,
    `Shore contact: ${p.shoreContact || "name to confirm"}. If we are not out by ${outBy} plus 30 minutes, they call the coastguard or local emergency number.`,
    ``,
    `Before we go in`,
    `- Check the forecast, tide and any local current or boat traffic warnings.`,
    `- Agree the entry and exit points, and a backup exit.`,
    `- Agree hand signals: OK, problem, end the dive, stay close.`,
    `- Check each other's kit: mask, snorkel, fins, suit, weight and surface marker buoy.`,
    ``,
    `In the water`,
    p.freedive
      ? `- One up, one down: one of us is always on the surface watching the other.`
      : `- Stay within sight of each other at all times.`,
    p.freedive ? `- Rest at the surface for at least twice the time of each dive.` : `- Keep the buoy with us so boats can see where we are.`,
    `- Either of us can end the dive at any time, no questions asked.`,
    ``,
    `This plan does not replace training. Dive within your qualifications and local rules.`,
  ];
  return lines.join("\n");
}
