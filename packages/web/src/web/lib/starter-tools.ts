// Scoring and checklist logic for the five Starter tools. Pure functions, no I/O,
// so the pages stay thin and the rules can be unit tested.

// ---------- Readiness wheels (Trip and Season) ----------
export type WheelArea = { key: string; label: string; question: string; fix: string; short?: string };

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

// ---------- Level 1 (Drift): the full Trip Readiness Wheel ----------
// Eight areas, and a tip for each one that changes with the score.
export type TipSet = { low: string; mid: string; high: string };

export const tripAreasFull: WheelArea[] = [
  ...tripAreas,
  {
    key: "fitness",
    label: "Fitness and skills",
    question: "Is the trip within what you and everyone coming can comfortably do?",
    fix: "Pick a shorter or easier version of the trip, or build up to it with one practice outing first.",
  },
  {
    key: "food",
    label: "Food and water",
    question: "Have you packed enough to eat and drink for the whole trip, plus some spare?",
    fix: "Pack water for the full time out and a bit more, plus food you can eat with cold or wet hands.",
  },
  {
    key: "travel",
    label: "Getting there",
    short: "Travel",
    question: "Do you know how you get there and back, including parking, transport times and access?",
    fix: "Check the last bus, ferry or train back, where you can park, and whether the access path is open.",
  },
  {
    key: "planb",
    label: "Plan B",
    short: "Plan B",
    question: "If something changes on the day, do you know what you will do instead?",
    fix: "Choose a shorter fallback route or a different spot nearby, and agree the point at which you switch to it.",
  },
];

export const tripTips: Record<string, TipSet> = {
  route: {
    low: "Write the route down with timings, and set a turn-back time you will stick to even if you feel fine.",
    mid: "Add a turn-back time to your plan and share the route with someone who is not coming.",
    high: "Your route is sorted. Take a photo of the map so you have it without signal.",
  },
  weather: {
    low: "Check the forecast and tide times now, and again on the morning. If they look marginal, move the day.",
    mid: "Look at how the wind and tide change through the day, not just at the start.",
    high: "Good. Look one last time before you leave, since coastal forecasts change quickly.",
  },
  kit: {
    low: "Lay everything out and check it against the forecast. Fix or replace anything worn before you go.",
    mid: "Pack one more warm layer than you think you need, and a dry bag for your phone and keys.",
    high: "Kit is ready. Keep a small spare bag with a dry layer in the car for the trip home.",
  },
  safety: {
    low: "Tell someone your plan and return time today, and save the coastguard number for where you are going.",
    mid: "Charge your phone fully and carry it in a waterproof case where you can reach it.",
    high: "You are covered. Agree what your contact should do if you are late back.",
  },
  fitness: {
    low: "Choose an easier version of the trip, or do a short practice outing first.",
    mid: "Plan rest stops, and check that the slowest person in the group is comfortable with the distance.",
    high: "You are well within your limits. Keep something in reserve for the way back.",
  },
  food: {
    low: "Pack water for the whole trip plus extra, and food that is easy to eat on the move.",
    mid: "Add a spare snack and a warm drink in a flask, especially if the trip could run long.",
    high: "Food and water are covered. Leave a drink and a snack in the car for when you get back.",
  },
  travel: {
    low: "Check how you get there and back, including the last transport home and where you can park.",
    mid: "Allow extra time for parking and the walk to the water, which often takes longer than expected.",
    high: "Travel is planned. Note a taxi number in case the last connection is missed.",
  },
  planb: {
    low: "Pick a fallback spot or a shorter route, and decide the point at which you switch to it.",
    mid: "Tell your group the Plan B before you set off, so nobody argues about it on the day.",
    high: "You have a clear Plan B. Use it without hesitation if conditions change.",
  },
};

export function tipFor(tips: Record<string, TipSet>, key: string, score: number) {
  const set = tips[key];
  if (!set) return "";
  const s = clampScore(score);
  return s <= 4 ? set.low : s <= 7 ? set.mid : set.high;
}

// Areas sorted weakest first (ties keep their original order), each with its tailored tip.
export function rankAreas(areas: WheelArea[], scores: Record<string, number>, tips: Record<string, TipSet>) {
  return areas
    .map((area, index) => ({ area, index, score: clampScore(scores[area.key] ?? 1) }))
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map(({ area, score }) => ({ area, score, tip: tipFor(tips, area.key, score) }));
}

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

// Level 1: the season wheel splits the four Starter areas into eight, each with a tip.
export const seasonAreasFull: WheelArea[] = [
  { key: "staffing", label: "Staffing", question: "Do you have the people you need for the busiest weeks, with cover for absences?", fix: seasonAreas[0].fix },
  { key: "stock", label: "Stock", question: "Are your stock levels set for the season ahead, with the items you cannot run out of counted?", fix: "Count the ten items you sell most and set a reorder level for each before the season starts." },
  { key: "suppliers", label: "Suppliers", question: "Are your supplier orders, lead times and a back-up supplier confirmed?", fix: "Confirm order dates and lead times with your main suppliers now, and name a second supplier for the items you cannot run out of." },
  { key: "bookings", label: "Bookings", question: "Are bookings coming in at the pace you need for the season?", fix: "Compare bookings so far with the same week last year and pick the weeks that are behind." },
  { key: "marketing", label: "Marketing", question: "Is your marketing planned for the quieter weeks, not only the busy ones?", fix: "Find the weeks with the fewest bookings and plan one offer or post for each of them before the season starts." },
  { key: "premises", label: "Premises", short: "Premises", question: "Are your premises, equipment and safety checks ready for the season?", fix: "Walk the site with a list: repairs, equipment servicing, signage and safety checks, each with a date." },
  { key: "cash", label: "Cash", question: "Could you cover a slow month or a surprise cost without strain?", fix: "Work out what a slow month costs you and set that amount aside." },
  { key: "contingency", label: "Contingency", short: "Plan B", question: "Do you know what you would do if the weather, a supplier or a key person let you down?", fix: "Write down what you would cut first if takings drop, and who covers if a key person is off." },
];

export const seasonTips: Record<string, TipSet> = {
  staffing: { low: "List your busiest weeks and who works each one, then line up two people you can call on at short notice.", mid: "Add a cover name for each busy week and agree holiday dates now, before the season starts.", high: "Keep a short induction sheet so a new or stand-in person can start quickly." },
  stock: { low: "Count your best sellers now and set a reorder level for each.", mid: "Check last season's sell-outs and raise the reorder level on those items.", high: "Review slow movers and clear them before the season to free cash and space." },
  suppliers: { low: "Call your main suppliers this week to confirm lead times and order dates.", mid: "Name a back-up supplier for anything you cannot run out of.", high: "Agree a delivery slot for your busiest weeks so stock arrives before the rush." },
  bookings: { low: "Look at bookings week by week and pick the three weakest weeks to work on first.", mid: "Offer the weakest weeks to past customers first, before you discount.", high: "Ask for deposits on busy dates to cut no-shows." },
  marketing: { low: "Plan one post or offer for each quiet week of the season.", mid: "Line up partners, such as nearby businesses, to share each other's offers.", high: "Collect reviews from this season's customers to use in next season's marketing." },
  premises: { low: "Make a list of repairs and checks with a date for each, starting with safety.", mid: "Book servicing for equipment before the season so it isn't done in a rush.", high: "Do a quick walk-round each week of the season to catch small problems early." },
  cash: { low: "Work out what a slow month costs and start setting money aside each week.", mid: "Spread big supplier payments so they don't all fall in the same month.", high: "Keep a month's costs in reserve and review it at the end of the season." },
  contingency: { low: "Write down the three things most likely to go wrong and what you would do for each.", mid: "Share your plan B with staff so anyone can act on it.", high: "Test one part of the plan before the season, such as a weather cancellation message." },
};

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

// Level 1 adds five more checks to the core five.
export const profileItemsLevel1: ProfileItem[] = [
  ...profileItems,
  { key: "headline", label: "Headline", question: "Does the first line say what you do and where, in under fifteen words?", fix: "Write one line: what you do, for whom, and the stretch of coast you cover." },
  { key: "prices", label: "Prices", question: "Does it give a starting price or a day rate, or say how you price?", fix: "Add a starting price or explain how you quote, so people know what to expect." },
  { key: "areas", label: "Areas", question: "Does it name the towns, harbours or regions you work in?", fix: "Name the places you cover by name, so local searches find you." },
  { key: "response", label: "Response", question: "Does it say how quickly you reply and the best way to reach you?", fix: "Say how quickly you reply, for example within one working day, and how to reach you." },
  { key: "fresh", label: "Up to date", question: "Has it been updated in the last three months?", fix: "Add one recent project, review or photo so the profile looks active." },
];

// Unanswered counts as no. `limit` caps the fixes shown (Starter shows the top three).
export function profileStrength(answers: Record<string, boolean>, items: ProfileItem[] = profileItems, limit = 3) {
  const done = items.filter((item) => answers[item.key]).length;
  const score = items.length ? Math.round((done / items.length) * 100) : 0;
  const fixes = items.filter((item) => !answers[item.key]).slice(0, limit);
  return { score, done, fixes };
}
