// Logic for the Coastal Experts Starter tools (batch 3). Pure functions, no I/O, unit tested.
import { num, toClock, toMinutes } from "./sea-lovers-tools";

const DAY = 86_400_000;
// Whole days from `from` to `to` (ISO dates). Bad dates read as null.
export function daysBetween(from: string, to: string): number | null {
  const a = Date.parse(from + "T00:00:00Z");
  const b = Date.parse(to + "T00:00:00Z");
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / DAY);
}
export function addDays(iso: string, days: number) {
  const t = Date.parse(iso + "T00:00:00Z");
  if (Number.isNaN(t)) return iso;
  return new Date(t + days * DAY).toISOString().slice(0, 10);
}

// ---------- Renewals and Deadlines Tracker ----------
export type Deadline = { date: string; item: string; forWhom: string; leadDays: number };
export type DeadlineStatus = "overdue" | "start" | "upcoming";
export function deadlineList(entries: Deadline[], today: string) {
  return entries
    .map((e) => {
      const left = daysBetween(today, e.date) ?? 0;
      const lead = num(e.leadDays, 0, 365);
      const status: DeadlineStatus = left < 0 ? "overdue" : left <= lead ? "start" : "upcoming";
      return { ...e, left, startBy: addDays(e.date, -lead), status };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ---------- Matter Intake Builder ----------
export type Intake = {
  client: string; contact: string; matterType: string; issue: string; jurisdiction: string; deadline: string; documents: string[]; otherParties: string;
};
const allDocs = ["Contract or agreement", "Correspondence", "Permits or licences", "Plans or surveys", "Invoices or accounts", "Photos"];
export const intakeDocuments = allDocs;
export function intakeSheet(p: Intake) {
  const missing = allDocs.filter((d) => !p.documents.includes(d));
  const lines = [
    `MATTER INTAKE · ${p.client || "Client to confirm"}`,
    ``,
    `Client: ${p.client || "to confirm"}${p.contact ? ` (${p.contact})` : ""}`,
    `Type of matter: ${p.matterType}`,
    `Jurisdiction: ${p.jurisdiction || "to confirm"}`,
    `Key date or deadline: ${p.deadline || "none given"}`,
    `Other parties: ${p.otherParties || "none named"}`,
    ``,
    `The issue, in the client's words`,
    p.issue || "To confirm with the client.",
    ``,
    `Documents held`,
    ...(p.documents.length ? p.documents.map((d) => `- ${d}`) : ["- None yet"]),
    ``,
    `Please confirm`,
    `- That the summary above is accurate and complete.`,
    `- What outcome you want, and by when.`,
    `- Anyone else who must be consulted or kept informed.`,
    ...missing.slice(0, 3).map((d) => `- Whether you hold any ${d.toLowerCase()}, and if so, send copies.`),
    ``,
    `This sheet records the instructions received. It is not advice.`,
  ];
  return { text: lines.join("\n"), missing };
}

// ---------- Day Rate Calculator ----------
export function dayRate(o: { income: number; overheads: number; travel: number; workingDays: number; billablePct: number; nichePct: number }) {
  const billableDays = Math.max(1, Math.round(num(o.workingDays, 1, 366) * (num(o.billablePct, 1, 100) / 100)));
  const costs = num(o.overheads) + num(o.travel);
  const breakEven = costs / billableDays;
  const base = (num(o.income) + costs) / billableDays;
  const rate = base * (1 + num(o.nichePct, 0, 200) / 100);
  return { billableDays, breakEven, base, rate, halfDay: rate * 0.55, hourly: rate / 7.5 };
}

// ---------- Risk Register Builder ----------
export type Risk = { name: string; likelihood: number; impact: number };
export function riskRating(score: number) {
  return score >= 15 ? "Critical" : score >= 10 ? "High" : score >= 5 ? "Medium" : "Low";
}
export function riskRegister(risks: Risk[]) {
  return risks
    .filter((r) => r.name.trim())
    .map((r, index) => {
      const likelihood = Math.round(num(r.likelihood, 1, 5));
      const impact = Math.round(num(r.impact, 1, 5));
      const score = likelihood * impact;
      return { name: r.name.trim(), likelihood, impact, score, rating: riskRating(score), index };
    })
    .sort((a, b) => b.score - a.score || b.impact - a.impact || a.index - b.index);
}
export function riskRegisterText(title: string, rows: ReturnType<typeof riskRegister>) {
  return [
    `RISK REGISTER · ${title || "Coastal business"}`,
    `Scores: likelihood × impact, each 1 to 5 (max 25).`,
    ``,
    ...rows.map((r, i) => `${i + 1}. ${r.name}: ${r.score} (${r.rating}) · likelihood ${r.likelihood}, impact ${r.impact}`),
    ``,
    `Review this register at least once a season, and after any incident.`,
  ].join("\n");
}

// ---------- Remote Visit Route Planner ----------
export type Stop = { name: string; travelMin: number; visitMin: number };
export function routePlan(o: { start: string; stops: Stop[]; returnMin: number; finishBy: string }) {
  let t = toMinutes(o.start) ?? 480;
  let travel = 0;
  let visiting = 0;
  const legs = o.stops
    .filter((s) => s.name.trim())
    .map((s) => {
      const tr = num(s.travelMin, 0, 600);
      const v = num(s.visitMin, 0, 600);
      const arrive = t + tr;
      const leave = arrive + v;
      travel += tr;
      visiting += v;
      t = leave;
      return { name: s.name.trim(), arrive, leave, travelMin: tr, visitMin: v };
    });
  const back = num(o.returnMin, 0, 600);
  travel += back;
  const home = t + back;
  const finishBy = toMinutes(o.finishBy);
  return { legs, home, travel, visiting, late: finishBy != null && home > finishBy ? home - finishBy : 0, travelShare: travel + visiting ? travel / (travel + visiting) : 0 };
}

// ---------- Deal and Lead Follow-Up Tracker ----------
export type Deal = { date: string; name: string; stage: string; value: number; gapDays: number };
export const dealStages = ["New enquiry", "Proposal sent", "Negotiating", "Won", "Lost"] as const;
const prompts: Record<string, string> = {
  "New enquiry": "Thank them for getting in touch and suggest a short call this week.",
  "Proposal sent": "Ask if they have had a chance to read the proposal and offer to answer questions.",
  Negotiating: "Recap what you have agreed so far and the one point still open.",
  Won: "Confirm next steps and the start date.",
  Lost: "Ask what would have made the difference, and keep in touch.",
};
export function followUps(entries: Deal[], today: string) {
  const rows = entries
    .map((e) => {
      const next = addDays(e.date, num(e.gapDays, 1, 365));
      const due = daysBetween(today, next) ?? 0;
      const open = e.stage !== "Won" && e.stage !== "Lost";
      return { ...e, next, due, open, overdue: open && due < 0, prompt: prompts[e.stage] ?? prompts["New enquiry"] };
    })
    .sort((a, b) => Number(b.open) - Number(a.open) || a.next.localeCompare(b.next));
  const pipeline = rows.filter((r) => r.open).reduce((s, r) => s + num(r.value), 0);
  return { rows, pipeline, overdue: rows.filter((r) => r.overdue).length };
}

// ---------- Commission Calculator ----------
export type Split = { label: string; pct: number };
export function commission(o: { value: number; ratePct: number; splits: Split[]; fees: number; costs: number }) {
  const gross = num(o.value) * (num(o.ratePct, 0, 100) / 100);
  const splits = o.splits
    .filter((s) => num(s.pct, 0, 100) > 0)
    .map((s) => ({ label: s.label || "Split", pct: num(s.pct, 0, 100), amount: gross * (num(s.pct, 0, 100) / 100) }));
  const shared = splits.reduce((s, x) => s + x.amount, 0);
  const net = gross - shared - num(o.fees) - num(o.costs);
  return { gross, splits, shared, net, effectivePct: num(o.value) ? (net / num(o.value)) * 100 : 0, keepPct: gross ? (net / gross) * 100 : 0 };
}

// ---------- Client Brief Builder (with the scope check folded in) ----------
export const scopeChecks = [
  { key: "deliverables", q: "Are the deliverables listed one by one?", gap: "List each deliverable, so both sides know what done looks like." },
  { key: "exclusions", q: "Have you written down what is not included?", gap: "Add exclusions: the work you will not do unless it is quoted separately." },
  { key: "acceptance", q: "Is it clear how the client will sign each deliverable off?", gap: "Agree how and by whom each deliverable is accepted." },
  { key: "changes", q: "Is there a process for changes to scope?", gap: "Add a change process: new requests are quoted and agreed in writing first." },
  { key: "dates", q: "Are there dates for each stage, not just the end?", gap: "Set a date for each stage, and what you need from the client to meet it." },
  { key: "approver", q: "Do you know who on the client side makes decisions?", gap: "Name the one person who approves decisions for the client." },
] as const;
export type Brief = { client: string; goal: string; scope: string; deliverables: string; exclusions: string; timeline: string; constraints: string; approver: string };
const bullets = (text: string) =>
  text.split(/\n|;/).map((s) => s.trim()).filter(Boolean).map((s) => `- ${s}`);
export function clientBrief(b: Brief, answers: Record<string, boolean>) {
  const gaps = scopeChecks.filter((c) => !answers[c.key]).map((c) => c.gap);
  const text = [
    `CLIENT BRIEF · ${b.client || "Client to confirm"}`,
    ``,
    `Goal`,
    b.goal || "To confirm.",
    ``,
    `Scope`,
    b.scope || "To confirm.",
    ``,
    `Deliverables`,
    ...(bullets(b.deliverables).length ? bullets(b.deliverables) : ["- To confirm"]),
    ``,
    `Not included`,
    ...(bullets(b.exclusions).length ? bullets(b.exclusions) : ["- To confirm"]),
    ``,
    `Timeline`,
    b.timeline || "To confirm.",
    ``,
    `Constraints`,
    b.constraints || "None noted.",
    ``,
    `Decisions and sign-off: ${b.approver || "to confirm"}`,
    `Changes to scope are quoted and agreed in writing before work starts.`,
  ].join("\n");
  return { text, gaps, ready: gaps.length === 0 };
}

// ---------- Job Quote Calculator (with the uncertain-conditions range folded in) ----------
export type Contingency = "none" | "low" | "medium" | "high";
const contingencyPct: Record<Contingency, number> = { none: 0, low: 0.1, medium: 0.2, high: 0.3 };
export function jobQuote(o: { materials: number; markupPct: number; hours: number; hourly: number; travel: number; marginPct: number; riskItems: number; contingency: Contingency }) {
  const materials = num(o.materials) * (1 + num(o.markupPct, 0, 300) / 100);
  const labour = num(o.hours) * num(o.hourly);
  const cost = materials + labour + num(o.travel);
  const margin = num(o.marginPct, 0, 90) / 100;
  const quote = cost / (1 - margin);
  const extra = (cost * contingencyPct[o.contingency] + num(o.riskItems)) / (1 - margin);
  return { materials, labour, cost, quote, marginAmount: quote - cost, high: quote + extra, contingencyPct: contingencyPct[o.contingency] * 100 };
}

// ---------- Session Fill Planner ----------
export type Session = { name: string; date: string; capacity: number; booked: number };
export function sessionFill(sessions: Session[], today: string, targetPct: number) {
  const target = num(targetPct, 10, 100) / 100;
  return sessions
    .filter((s) => s.name.trim())
    .map((s) => {
      const cap = Math.max(1, Math.round(num(s.capacity, 1, 10000)));
      const booked = Math.min(cap, Math.round(num(s.booked, 0, 10000)));
      const need = Math.max(0, Math.ceil(cap * target) - booked);
      const days = daysBetween(today, s.date) ?? 0;
      const pushes = [
        { before: 21, what: "Announce it to your list and social channels" },
        { before: 14, what: "Share a story or photo from a past session" },
        { before: 7, what: "Last places: a direct message to past attendees" },
        { before: 2, what: "Final call, and ask attendees to bring a friend" },
      ]
        .filter((p) => days >= p.before)
        .map((p) => ({ date: addDays(s.date, -p.before), what: p.what }));
      return { ...s, name: s.name.trim(), cap, booked, fillPct: Math.round((booked / cap) * 100), need, days, urgency: need ? need / Math.max(1, days) : 0, pushes };
    })
    .sort((a, b) => b.urgency - a.urgency || a.date.localeCompare(b.date));
}

// ---------- Learner Progress Tracker ----------
export function learnerProgress(skills: string[], learners: { name: string; done: string[] }[]) {
  const list = skills.filter(Boolean);
  const rows = learners.map((l) => {
    const done = list.filter((s) => l.done.includes(s));
    return { name: l.name, done: done.length, pct: list.length ? Math.round((done.length / list.length) * 100) : 0, next: list.find((s) => !l.done.includes(s)) ?? null };
  });
  const coverage = list.map((s) => ({ skill: s, count: learners.filter((l) => l.done.includes(s)).length }));
  const weakest = coverage.length && learners.length ? coverage.reduce((a, b) => (b.count < a.count ? b : a)) : null;
  return { rows: rows.sort((a, b) => a.pct - b.pct), weakest };
}

// ---------- Seasonal Workload Planner ----------
export function workloadYear(workDays: number[], capacity: number) {
  const cap = Math.max(1, num(capacity, 1, 31));
  const months = workDays.map((d, i) => {
    const load = num(d, 0, 31);
    const pct = Math.round((load / cap) * 100);
    return { i, load, pct, kind: pct > 100 ? "over" : pct < 50 ? "quiet" : "steady", short: Math.max(0, cap * 0.5 - load), over: Math.max(0, load - cap) };
  });
  const quiet = months.filter((m) => m.kind === "quiet");
  const over = months.filter((m) => m.kind === "over");
  return { months, quiet, over, quietDays: Math.round(quiet.reduce((s, m) => s + (cap - m.load), 0)), overDays: Math.round(over.reduce((s, m) => s + m.over, 0)) };
}

export { toClock };
