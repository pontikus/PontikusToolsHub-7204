// Scoring and checklist logic for the five Starter tools. Pure functions, no I/O,
// so the pages stay thin and the rules can be unit tested.

// ---------- Readiness wheels (Trip and Season) ----------
export type WheelArea = { key: string; label: string; question: string; fix: string };

export const tripAreas: WheelArea[] = [
  {
    key: "route",
    label: "Route and timing",
    question: "Do you know where you are going, how long it takes and when you need to be back?",
    fix: "Write down the route, the time you set off and the latest time you will turn back. Share it with someone who is not coming.",
  },
  {
    key: "weather",
    label: "Weather and tides",
    question: "Have you checked the forecast, the tide times and how they change through the day?",
    fix: "Check the forecast and tide times the evening before and again on the morning. Pick a backup day if conditions look marginal.",
  },
  {
    key: "kit",
    label: "Kit and clothing",
    question: "Is your kit packed, checked and right for the conditions?",
    fix: "Lay your kit out the night before and check it against the conditions. Pack one more warm layer than you think you need.",
  },
  {
    key: "safety",
    label: "Safety and contacts",
    question: "Does someone know your plan, and can you call for help if you need to?",
    fix: "Tell someone your plan and your return time, carry a charged phone in a waterproof case, and know how to call the coastguard where you are.",
  },
];

// Areas the full wheel adds at Level 1 (shown in the ladder, not scored at Starter).
export const tripAreasLevel1 = ["Fitness and skills", "Food and water", "Getting there", "Plan B"];

export const seasonAreas: WheelArea[] = [
  {
    key: "staffing",
    label: "Staffing",
    question: "Do you have the people you need for the busiest weeks, with cover for absences?",
    fix: "List your busiest weeks and who is working each one. Line up at least one person you can call on at short notice.",
  },
  {
    key: "stock",
    label: "Stock and suppliers",
    question: "Are your stock levels and supplier orders set for the season ahead?",
    fix: "Confirm order dates and lead times with your main suppliers now, and name a second supplier for the items you cannot run out of.",
  },
  {
    key: "bookings",
    label: "Bookings and marketing",
    question: "Are bookings coming in, and is your marketing planned for the quieter weeks?",
    fix: "Find the weeks with the fewest bookings and plan one offer or post for each of them before the season starts.",
  },
  {
    key: "cash",
    label: "Cash and contingency",
    question: "Could you cover a slow month or a surprise cost without strain?",
    fix: "Work out what a slow month costs you and set that amount aside. Decide now what you would cut first if takings drop.",
  },
];

export const seasonAreasLevel1 = [
  "Staffing",
  "Stock",
  "Bookings",
  "Marketing",
  "Premises",
  "Suppliers",
  "Cash",
  "Contingency",
];

export type WheelResult = {
  score: number; // 0–100
  weakest: WheelArea;
  band: "low" | "mid" | "high";
};

export function clampScore(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(10, Math.max(1, Math.round(value)));
}

// Scores are 1–10 per area. Overall score is the average on a 0–100 scale.
// The weakest area is the lowest score; ties go to the area listed first.
export function scoreWheel(areas: WheelArea[], scores: Record<string, number>): WheelResult {
  const values = areas.map((a) => clampScore(scores[a.key] ?? 1));
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;
  const score = Math.round(average * 10);
  let weakestIndex = 0;
  values.forEach((v, i) => {
    if (v < values[weakestIndex]) weakestIndex = i;
  });
  const band = score < 50 ? "low" : score < 75 ? "mid" : "high";
  return { score, weakest: areas[weakestIndex], band };
}

// ---------- Sea Swim Kit Checker ----------
export type SwimType = "dip" | "distance" | "remote";
export type SwimGroup = "alone" | "buddy" | "group";
export type SwimConditions = "calm" | "choppy" | "cold";
export type KitItem = { id: string; text: string; group: "Kit" | "Safety" | "After your swim" };

export function seaSwimChecklist(type: SwimType, group: SwimGroup, conditions: SwimConditions) {
  const items: KitItem[] = [
    { id: "hat", text: "Bright swim hat so you can be seen", group: "Kit" },
    { id: "float", text: "Tow float", group: "Kit" },
    { id: "tide", text: "Check the tide times and forecast before you leave", group: "Safety" },
    { id: "exit", text: "Pick your way in and out before you get in", group: "Safety" },
    { id: "towel", text: "Towel and warm layers laid out ready", group: "After your swim" },
    { id: "drink", text: "Warm drink in a flask", group: "After your swim" },
  ];
  if (type === "distance" || conditions === "choppy")
    items.push({ id: "goggles", text: "Goggles, plus a spare pair", group: "Kit" });
  if (type === "distance") {
    items.push({ id: "route", text: "Plan your route and the points where you can get out early", group: "Safety" });
    items.push({ id: "snack", text: "Snack for after the swim", group: "After your swim" });
  }
  if (type === "remote") {
    items.push({ id: "phone", text: "Charged phone in a waterproof pouch", group: "Safety" });
    items.push({ id: "location", text: "Note an exact location you can give the emergency services", group: "Safety" });
    items.push({ id: "firstaid", text: "Small first aid kit", group: "Kit" });
  }
  if (conditions === "cold") {
    items.push({ id: "neoprene", text: "Neoprene gloves and socks, or a wetsuit", group: "Kit" });
    items.push({ id: "short", text: "Plan a shorter swim and get in slowly", group: "Safety" });
    items.push({ id: "robe", text: "Changing robe or hat for after", group: "After your swim" });
  }
  if (conditions === "choppy")
    items.push({ id: "shore", text: "Stay close to shore and parallel to it", group: "Safety" });
  if (group === "alone") {
    items.push({ id: "tell", text: "Tell someone where you are swimming and when you will be back", group: "Safety" });
  } else if (group === "buddy") {
    items.push({ id: "buddy", text: "Agree a signal with your buddy for getting out", group: "Safety" });
  } else {
    items.push({ id: "count", text: "Count everyone in and count everyone out", group: "Safety" });
  }
  return items;
}

// ---------- Occupancy Gap Finder ----------
export const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
export const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export type OccupancyInput = {
  rooms: number;
  rate: number;
  target: number; // %
  occupancy: number[]; // % per month, 12 values
};
export type MonthGap = { month: string; occupancy: number; gapPct: number; lostNights: number; lostRevenue: number };

const safe = (n: number, max = Number.MAX_SAFE_INTEGER) =>
  Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0;

export function occupancyGaps(input: OccupancyInput) {
  const rooms = Math.floor(safe(input.rooms, 10000));
  const rate = safe(input.rate, 1_000_000);
  const target = safe(input.target, 100);
  const rows: MonthGap[] = months.map((month, i) => {
    const occupancy = safe(input.occupancy[i] ?? 0, 100);
    const gapPct = Math.max(0, target - occupancy);
    const lostNights = Math.round((rooms * daysInMonth[i] * gapPct) / 100);
    return { month, occupancy, gapPct, lostNights, lostRevenue: lostNights * rate };
  });
  const gaps = rows.filter((r) => r.gapPct > 0);
  const worst = gaps.reduce<MonthGap | null>((w, r) => (!w || r.lostRevenue > w.lostRevenue ? r : w), null);
  return {
    rows,
    gapMonths: gaps.length,
    totalLostNights: rows.reduce((s, r) => s + r.lostNights, 0),
    totalLostRevenue: rows.reduce((s, r) => s + r.lostRevenue, 0),
    worst,
  };
}

// ---------- Profile Strength Checker ----------
export type ProfileItem = {
  key: string;
  label: string;
  question: string;
  fix: string;
  maker?: { name: string; slug: string };
};

// Listed in fix-priority order: the first unticked items become the top three fixes.
export const profileItems: ProfileItem[] = [
  {
    key: "services",
    label: "Services",
    question: "Does your profile list the services you offer, in plain words?",
    fix: "List each service you offer in one line, with who it is for.",
    maker: { name: "Rate Card Builder", slug: "rate-card" },
  },
  {
    key: "proof",
    label: "Proof",
    question: "Does it show proof of your expertise, such as qualifications, licences or past projects?",
    fix: "Add your qualifications, licences or two past projects that show what you do.",
    maker: { name: "Credential Card Maker", slug: "credential-card" },
  },
  {
    key: "reviews",
    label: "Reviews",
    question: "Does it include reviews or testimonials from people you have worked with?",
    fix: "Ask two recent clients for a sentence you can quote, with their permission.",
  },
  {
    key: "contact",
    label: "Contact",
    question: "Are your contact details and availability up to date?",
    fix: "Check your email, phone and the areas you cover, and say when you are available.",
    maker: { name: "Availability Poster Maker", slug: "availability" },
  },
  {
    key: "photo",
    label: "Photo",
    question: "Does it have a clear photo of you or your logo?",
    fix: "Add a clear, well-lit photo of you or your logo.",
    maker: { name: "Media Kit Builder", slug: "media-kit" },
  },
];

export function profileStrength(answers: Record<string, boolean>) {
  const done = profileItems.filter((item) => answers[item.key]).length;
  const score = Math.round((done / profileItems.length) * 100);
  const fixes = profileItems.filter((item) => !answers[item.key]).slice(0, 3);
  return { score, done, fixes };
}
