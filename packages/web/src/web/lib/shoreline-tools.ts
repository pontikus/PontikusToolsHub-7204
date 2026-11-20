// Logic for the Shoreline Businesses Starter tools (batch 4). Pure functions, no I/O, unit tested.
import { addDays, daysBetween } from "./coastal-experts-tools";
import { num } from "./sea-lovers-tools";

const lines = (text: string) => text.split(/\n|;/).map((s) => s.trim()).filter(Boolean);
const money = (cur: string, v: number) => cur + Math.round(v).toLocaleString("en-GB");

// ---------- Guest Welcome Message Generator ----------
export type Welcome = {
  property: string; guest: string; arrival: string; checkIn: string; checkOut: string; access: string;
  parking: string; wifiName: string; wifiPassword: string; houseNotes: string; host: string; contact: string; tone: "warm" | "short";
};
export function welcomeMessage(w: Welcome) {
  const name = w.guest.trim() || "there";
  const place = w.property.trim() || "your stay";
  const out: string[] = [];
  out.push(w.tone === "short" ? `Hi ${name}, here are your arrival details for ${place}.` : `Hi ${name}, we're looking forward to welcoming you to ${place}! Here is everything you need for your arrival.`);
  const when = [w.arrival && `Arrival: ${w.arrival}`, w.checkIn && `Check-in from ${w.checkIn}`, w.checkOut && `Check-out by ${w.checkOut}`].filter(Boolean);
  if (when.length) out.push(when.join(" · "));
  if (w.access.trim()) out.push(`Getting in: ${w.access.trim()}`);
  if (w.parking.trim()) out.push(`Parking: ${w.parking.trim()}`);
  if (w.wifiName.trim()) out.push(`Wi-Fi: ${w.wifiName.trim()}${w.wifiPassword.trim() ? `, password ${w.wifiPassword.trim()}` : ""}`);
  const notes = lines(w.houseNotes);
  if (notes.length) out.push(`Good to know:\n${notes.map((n) => `- ${n}`).join("\n")}`);
  out.push(
    w.contact.trim()
      ? `If you need anything, contact ${w.host.trim() || "us"} on ${w.contact.trim()}.`
      : `If you need anything, just reply to this message.`,
  );
  out.push(w.tone === "short" ? `See you soon${w.host.trim() ? `, ${w.host.trim()}` : ""}.` : `Safe travels, and see you soon!${w.host.trim() ? `\n${w.host.trim()}` : ""}`);
  const missing = [!w.checkIn && "check-in time", !w.access.trim() && "how to get in", !w.contact.trim() && "a contact number"].filter(Boolean) as string[];
  return { text: out.join("\n\n"), missing };
}

// ---------- Charter Cash Flow Smoother ----------
// Deposits for a month's charters arrive the month before; the balance arrives in the month.
export function charterCashFlow(o: { opening: number; price: number; depositPct: number; costPerCharter: number; fixedMonthly: number; bookings: number[] }) {
  const dep = num(o.depositPct, 0, 100) / 100;
  const price = num(o.price);
  const b = o.bookings.map((x) => num(x));
  let balance = num(o.opening);
  const months = b.map((n, i) => {
    const income = price * (1 - dep) * n + price * dep * (b[i + 1] ?? 0);
    const costs = num(o.fixedMonthly) + num(o.costPerCharter) * n;
    balance += income - costs;
    return { i, income, costs, net: income - costs, balance };
  });
  const tightest = months.reduce((a, m) => (m.balance < a.balance ? m : a), months[0]);
  return { months, tightest, negative: months.filter((m) => m.balance < 0).length, end: balance };
}

// ---------- Group Booking Quote Builder ----------
export type Extra = { label: string; price: number; perPerson: boolean };
export function groupQuote(o: {
  business: string; client: string; date: string; route: string; groupSize: number; basePrice: number; perPerson: number;
  extras: Extra[]; discountPct: number; depositPct: number; validDays: number; currency: string;
}) {
  const size = Math.round(num(o.groupSize, 0, 10000));
  const items = [
    { label: "Booking", amount: num(o.basePrice) },
    { label: `${size} guests × ${money(o.currency, num(o.perPerson))}`, amount: num(o.perPerson) * size },
    ...o.extras.filter((e) => e.label.trim() && num(e.price) > 0).map((e) => ({ label: e.perPerson ? `${e.label.trim()} (${size} × ${money(o.currency, num(e.price))})` : e.label.trim(), amount: e.perPerson ? num(e.price) * size : num(e.price) })),
  ].filter((x) => x.amount > 0);
  const subtotal = items.reduce((s, x) => s + x.amount, 0);
  const discount = subtotal * (num(o.discountPct, 0, 100) / 100);
  const total = subtotal - discount;
  const deposit = total * (num(o.depositPct, 0, 100) / 100);
  const perHead = size ? total / size : 0;
  const text = [
    `QUOTE${o.business.trim() ? ` · ${o.business.trim()}` : ""}`,
    `For: ${o.client.trim() || "Your group"}`,
    [o.date && `Date: ${o.date}`, o.route.trim() && `Route or plan: ${o.route.trim()}`, size && `Group: ${size} guests`].filter(Boolean).join("\n"),
    items.map((x) => `- ${x.label}: ${money(o.currency, x.amount)}`).join("\n"),
    [discount > 0 && `Group discount (${num(o.discountPct, 0, 100)}%): −${money(o.currency, discount)}`, `Total: ${money(o.currency, total)}${size ? ` (${money(o.currency, perHead)} per guest)` : ""}`].filter(Boolean).join("\n"),
    `${deposit > 0 ? `A deposit of ${money(o.currency, deposit)} secures the date. ` : ""}This quote is valid for ${Math.round(num(o.validDays, 1, 365))} days.`,
  ]
    .filter(Boolean)
    .join("\n\n");
  return { items, subtotal, discount, total, deposit, perHead, text };
}

// ---------- Buyer and Account Follow-Up ----------
export type Account = { date: string; name: string; kind: string; gapDays: number; value: number };
export function accountFollowUps(entries: Account[], today: string) {
  const rows = entries
    .map((e) => {
      const gap = num(e.gapDays, 1, 365);
      const due = addDays(e.date, gap);
      const late = -(daysBetween(today, due) ?? 0);
      const status = late > gap / 2 ? "at risk" : late >= 0 ? "due" : "ok";
      return { ...e, due, late, status } as Account & { due: string; late: number; status: "at risk" | "due" | "ok" };
    })
    .sort((a, b) => b.late - a.late);
  const chase = rows.filter((r) => r.status !== "ok");
  return { rows, chase: chase.length, atRiskValue: rows.filter((r) => r.status === "at risk").reduce((s, r) => s + num(r.value), 0) };
}

// ---------- Catch Margin Calculator ----------
export type CatchLine = { name: string; costPerKg: number; yieldPct: number; pricePerKg: number };
// yieldPct is the share of the bought weight you can sell (fillets from whole fish, for example).
export function catchMargins(rows: CatchLine[]) {
  const out = rows
    .filter((r) => r.name.trim() && num(r.pricePerKg) > 0)
    .map((r) => {
      const y = num(r.yieldPct, 1, 100) / 100;
      const trueCost = num(r.costPerKg) / y;
      const margin = num(r.pricePerKg) - trueCost;
      return { name: r.name.trim(), trueCost, margin, marginPct: (margin / num(r.pricePerKg)) * 100, breakEvenPrice: trueCost };
    });
  const weakest = out.length ? out.reduce((a, r) => (r.marginPct < a.marginPct ? r : a)) : null;
  return { rows: out, weakest };
}

// ---------- Instructor Rota Planner ----------
export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export function instructorRota(instructors: { name: string; days: string[]; maxDays: number }[], need: number[]) {
  const people = instructors.filter((p) => p.name.trim()).map((p) => ({ ...p, name: p.name.trim(), shifts: 0 }));
  const days = weekDays.map((d, i) => {
    const want = Math.round(num(need[i], 0, 50));
    const free = people.filter((p) => p.days.includes(d) && p.shifts < num(p.maxDays, 0, 7));
    free.sort((a, b) => a.shifts - b.shifts);
    const on = free.slice(0, want);
    on.forEach((p) => p.shifts++);
    return { day: d, need: want, on: on.map((p) => p.name), short: want - on.length };
  });
  // Re-check spare cover once every day is filled: who was available but not used.
  const spare = days.map((d) => people.filter((p) => p.days.includes(d.day) && !d.on.includes(p.name)).map((p) => p.name));
  return { days: days.map((d, i) => ({ ...d, spare: spare[i] })), gaps: days.filter((d) => d.short > 0), shifts: people.map((p) => ({ name: p.name, shifts: p.shifts })) };
}

// ---------- Stock Turn Calculator ----------
export type StockLine = { name: string; stockValue: number; monthlySales: number; leadWeeks: number };
// monthlySales is at cost, so it compares with the stock value.
export function stockTurn(rows: StockLine[]) {
  const out = rows
    .filter((r) => r.name.trim() && num(r.stockValue) > 0)
    .map((r) => {
      const sales = num(r.monthlySales);
      const turns = (sales * 12) / num(r.stockValue);
      const coverWeeks = sales > 0 ? (num(r.stockValue) / sales) * (52 / 12) : Infinity;
      const needWeeks = num(r.leadWeeks) + 2;
      const excess = coverWeeks === Infinity ? num(r.stockValue) : Math.max(0, num(r.stockValue) * (1 - needWeeks / coverWeeks));
      return { name: r.name.trim(), turns, coverWeeks, excess };
    })
    .sort((a, b) => a.turns - b.turns);
  return { rows: out, slowest: out.slice(0, 3).filter((r) => r.excess > 0), tiedUp: out.reduce((s, r) => s + r.excess, 0) };
}

// ---------- Partnership Match Checker ----------
export const partnerQuestions = [
  { key: "values", q: "Do they say publicly what they stand for, and does it match your values?", ask: "What do you stand for, and where do you draw the line?" },
  { key: "practice", q: "Can you see their practices, not just their claims (suppliers, waste, staff)?", ask: "Can you show us how you work day to day: suppliers, waste and how you treat staff?" },
  { key: "evidence", q: "Do they measure or report their impact in some way?", ask: "How do you measure what you achieve, and could we see it?" },
  { key: "audience", q: "Do they reach people you want to reach?", ask: "Who are your customers, and how do you reach them?" },
  { key: "aims", q: "Do you want the same thing from working together?", ask: "What would make this partnership a success for you in a year?" },
  { key: "capacity", q: "Do they have the time and people to deliver their side?", ask: "Who on your side will run this, and how much time can they give?" },
  { key: "local", q: "Are they trusted locally (community, reviews, other partners)?", ask: "Who else have you partnered with, and could we speak to them?" },
  { key: "exit", q: "Would it be easy to end the partnership on good terms if needed?", ask: "How should either of us end this if it stops working?" },
] as const;
export type Answer = "yes" | "unsure" | "no";
export function partnershipFit(answers: Record<string, Answer>) {
  const pts = { yes: 2, unsure: 1, no: 0 } as const;
  const total = partnerQuestions.reduce((s, q) => s + pts[answers[q.key] ?? "unsure"], 0);
  const score = Math.round((total / (partnerQuestions.length * 2)) * 100);
  const band = score >= 75 ? "Strong fit" : score >= 50 ? "Worth exploring" : "Weak fit";
  const ask = partnerQuestions.filter((q) => (answers[q.key] ?? "unsure") !== "yes").sort((a, b) => pts[answers[a.key] ?? "unsure"] - pts[answers[b.key] ?? "unsure"]);
  const redFlags = partnerQuestions.filter((q) => answers[q.key] === "no" && (q.key === "values" || q.key === "practice"));
  return { score, band, ask, redFlags };
}

// ---------- Impact Pitch Pack Builder ----------
export const pitchAudiences = {
  council: { label: "Council or public body", why: "how it supports local plans and residents", close: "We'd welcome a short meeting to discuss how this fits your priorities." },
  sponsor: { label: "Business sponsor", why: "what your brand gains and how it will be seen", close: "We'd love to show you how your brand could be part of it." },
  funder: { label: "Grant funder or trust", why: "the need, the outcomes and how they will be measured", close: "We'd be glad to send a full application or answer any questions." },
  partner: { label: "Local business partner", why: "what each side brings and gains", close: "Could we meet for a coffee to talk it through?" },
} as const;
export type PitchAudience = keyof typeof pitchAudiences;
export function impactPitch(p: { project: string; org: string; problem: string; outcomes: string; audience: PitchAudience; ask: string; timeframe: string; measure: string }) {
  const a = pitchAudiences[p.audience];
  const outcomes = lines(p.outcomes);
  const gaps = [!p.problem.trim() && "the problem it solves", !outcomes.length && "the outcomes", !p.ask.trim() && "what you are asking for", !p.measure.trim() && "how you'll measure it"].filter(Boolean) as string[];
  const text = [
    `${(p.project.trim() || "Project name").toUpperCase()}${p.org.trim() ? ` · ${p.org.trim()}` : ""}`,
    `For: ${a.label}`,
    `The problem\n${p.problem.trim() || "[Describe the problem in one or two sentences.]"}`,
    `What we will do and what will change\n${outcomes.length ? outcomes.map((o) => `- ${o}`).join("\n") : "- [Outcome]"}`,
    `How we'll know it worked\n${p.measure.trim() || "[What you will count or record, and how often.]"}`,
    `What we're asking for\n${p.ask.trim() || "[Money, in-kind support, space or time.]"}${p.timeframe.trim() ? `\nTimeframe: ${p.timeframe.trim()}` : ""}`,
    a.close,
  ].join("\n\n");
  return { text, gaps, focus: a.why };
}

// ---------- Event Break-Even Calculator ----------
export function eventBreakEven(o: { fixed: number; price: number; perHead: number; feesPct: number; capacity: number; expected: number }) {
  const net = num(o.price) * (1 - num(o.feesPct, 0, 100) / 100) - num(o.perHead);
  const cap = Math.round(num(o.capacity));
  const exp = Math.min(cap || Infinity, Math.round(num(o.expected)));
  const breakEven = net > 0 ? Math.ceil(num(o.fixed) / net) : null;
  const profit = (n: number) => n * net - num(o.fixed);
  const low = Math.round(exp * 0.75);
  return {
    net, breakEven, possible: breakEven !== null && (!cap || breakEven <= cap),
    breakEvenPct: breakEven !== null && cap ? Math.round((breakEven / cap) * 100) : null,
    range: { low: { n: low, profit: profit(low) }, expected: { n: exp, profit: profit(exp) }, sellOut: cap ? { n: cap, profit: profit(cap) } : null },
  };
}

// ---------- Trade Partner Outreach Generator ----------
export const partnerTypes = {
  accommodation: { label: "Hotels and holiday lets", offer: "something extra to offer guests that week", ask: "mention the event to guests, or share it in your welcome pack" },
  food: { label: "Cafés, bars and restaurants", offer: "more people in town, before and after the event", ask: "put up a poster or offer a small deal to ticket holders" },
  activity: { label: "Tour and activity operators", offer: "a ready audience who are already out enjoying the coast", ask: "cross-promote with us, or join as an add-on to tickets" },
  media: { label: "Local media and community pages", offer: "a local story your readers will want to know about", ask: "share the event or run a short listing" },
  clubs: { label: "Clubs and community groups", offer: "a day out for your members", ask: "share it with your members, or come along as a group" },
} as const;
export type PartnerType = keyof typeof partnerTypes;
export function outreachMessages(o: { event: string; date: string; place: string; audience: string; gain: string; sender: string; types: PartnerType[] }) {
  const ev = o.event.trim() || "our event";
  return o.types.map((t) => {
    const p = partnerTypes[t];
    const text = [
      `Hi,`,
      `We're running ${ev}${o.date ? ` on ${o.date}` : ""}${o.place.trim() ? ` at ${o.place.trim()}` : ""}${o.audience.trim() ? `, for ${o.audience.trim()}` : ""}.`,
      `We think it could bring you ${p.offer}${o.gain.trim() ? `, and we can offer ${o.gain.trim()}` : ""}.`,
      `Would you be happy to ${p.ask}? I'd be glad to send details or have a quick call.`,
      `Thanks,\n${o.sender.trim() || "[Your name]"}`,
    ].join("\n\n");
    return { type: t, label: p.label, text };
  });
}

// ---------- Retainer Proposal Builder ----------
export function retainerProposal(o: { client: string; agency: string; services: string; goals: string; hours: number; fee: number; term: number; notice: number; currency: string; extraRate: number }) {
  const services = lines(o.services);
  const goals = lines(o.goals);
  const hourly = num(o.hours) ? num(o.fee) / num(o.hours) : 0;
  const text = [
    `RETAINER PROPOSAL · ${o.client.trim() || "Client"}${o.agency.trim() ? `\nFrom ${o.agency.trim()}` : ""}`,
    `What you want to achieve\n${goals.length ? goals.map((g) => `- ${g}`).join("\n") : "- [Goal]"}`,
    `What's included each month\n${services.length ? services.map((s) => `- ${s}`).join("\n") : "- [Service]"}${num(o.hours) ? `\nUp to ${num(o.hours)} hours a month.` : ""}`,
    `Investment\n${money(o.currency, num(o.fee))} a month, for a minimum of ${Math.round(num(o.term, 1, 60))} months, then rolling with ${Math.round(num(o.notice, 0, 365))} days' notice.${num(o.extraRate) ? `\nExtra work outside the retainer: ${money(o.currency, num(o.extraRate))} an hour, agreed before it starts.` : ""}`,
    `How we'll work\nA short monthly report on progress against your goals, and a call each month to plan the next.`,
  ].join("\n\n");
  const warnings: string[] = [];
  if (num(o.extraRate) && hourly && hourly < num(o.extraRate) * 0.7) warnings.push("The retainer works out much cheaper per hour than your extra-work rate. Check the hours or the fee.");
  if (!goals.length) warnings.push("Add at least one goal, so the client can see what they are paying for.");
  return { text, hourly, warnings };
}

// ---------- Weather Disruption Plan Builder ----------
export const fallbackOptions = ["Move to another date", "Move to a sheltered spot or indoors", "Swap to a shorter or calmer version", "Voucher for a later date", "Full refund"] as const;
export function weatherPlan(o: { business: string; services: string; decideHours: number; triggers: string; fallbacks: string[]; channels: string; refund: string; atRisk: number }) {
  const h = Math.round(num(o.decideHours, 1, 168));
  const check = h + 24;
  const options = o.fallbacks.length ? o.fallbacks : ["Move to another date"];
  const steps = [
    { when: `${check} hours before`, what: "Check the forecast and warn staff that a call is coming." },
    { when: `${h} hours before`, what: `Make the go or no-go call${o.triggers.trim() ? ` against your limits: ${o.triggers.trim()}` : ""}.` },
    { when: "Straight after the call", what: `Message every booked customer${o.channels.trim() ? ` by ${o.channels.trim()}` : ""} with their options.` },
    { when: "Within 24 hours", what: "Confirm each customer's choice, rebook or refund, and update your website and social pages." },
  ];
  const message = [
    `Hi [name], because of the forecast we've had to make the call not to run ${o.services.trim() || "your booking"} on [date]. Safety comes first and we're sorry for the change.`,
    `Your options:\n${options.map((f) => `- ${f}`).join("\n")}`,
    `Just reply with what suits you${o.refund.trim() ? `. ${o.refund.trim()}` : ""}.`,
    `${o.business.trim() || "[Your business]"}`,
  ].join("\n\n");
  const text = [
    `WEATHER DISRUPTION PLAN · ${o.business.trim() || "Your business"}`,
    `Covers: ${o.services.trim() || "[services]"}${num(o.atRisk) ? ` · about ${Math.round(num(o.atRisk))} bookings on a typical day` : ""}`,
    `Timeline\n${steps.map((s) => `- ${s.when}: ${s.what}`).join("\n")}`,
    `Options we offer\n${options.map((f) => `- ${f}`).join("\n")}`,
    `Message to customers\n${message}`,
  ].join("\n\n");
  return { steps, message, text };
}
