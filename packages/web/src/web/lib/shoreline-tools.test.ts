import { describe, expect, test } from "bun:test";
import {
  accountFollowUps,
  catchMargins,
  charterCashFlow,
  eventBreakEven,
  groupQuote,
  impactPitch,
  instructorRota,
  outreachMessages,
  partnershipFit,
  retainerProposal,
  stockTurn,
  weatherPlan,
  welcomeMessage,
} from "./shoreline-tools";

describe("welcomeMessage", () => {
  test("builds the message and lists what is missing", () => {
    const r = welcomeMessage({ property: "Harbour Loft", guest: "Sam", arrival: "Fri 4 Dec", checkIn: "15:00", checkOut: "10:00", access: "", parking: "Quay car park", wifiName: "Loft", wifiPassword: "sea", houseNotes: "Bins on Tuesday; Heating on the hall panel", host: "Jo", contact: "", tone: "warm" });
    expect(r.text).toContain("Hi Sam");
    expect(r.text).toContain("Wi-Fi: Loft, password sea");
    expect(r.text).toContain("- Bins on Tuesday\n- Heating on the hall panel");
    expect(r.missing).toEqual(["how to get in", "a contact number"]);
  });
});

describe("charterCashFlow", () => {
  test("takes deposits a month early and finds the tightest month", () => {
    const r = charterCashFlow({ opening: 1000, price: 1000, depositPct: 50, costPerCharter: 200, fixedMonthly: 1500, bookings: [0, 2, 4] });
    expect(r.months.map((m) => m.income)).toEqual([1000, 3000, 2000]);
    expect(r.months.map((m) => m.balance)).toEqual([500, 1600, 1300]);
    expect(r.tightest.i).toBe(0);
    expect(r.negative).toBe(0);
  });
});

describe("groupQuote", () => {
  test("adds per-guest items, discount and deposit", () => {
    const r = groupQuote({ business: "Bay Charters", client: "Office party", date: "2027-06-01", route: "Bay loop", groupSize: 10, basePrice: 300, perPerson: 20, extras: [{ label: "Lunch", price: 15, perPerson: true }, { label: "Photos", price: 100, perPerson: false }, { label: "", price: 50, perPerson: false }], discountPct: 10, depositPct: 25, validDays: 14, currency: "£" });
    expect(r.subtotal).toBe(300 + 200 + 150 + 100);
    expect(r.total).toBe(675);
    expect(r.deposit).toBe(168.75);
    expect(r.text).toContain("Total: £675 (£68 per guest)");
  });
});

describe("accountFollowUps", () => {
  test("flags due and at-risk accounts", () => {
    const r = accountFollowUps(
      [
        { date: "2026-11-01", name: "Fish Co", kind: "Buyer", gapDays: 14, value: 800 },
        { date: "2026-11-05", name: "Quay Café", kind: "Account", gapDays: 7, value: 200 },
        { date: "2026-11-18", name: "Deli", kind: "Account", gapDays: 7, value: 100 },
      ],
      "2026-11-20",
    );
    expect(r.rows.map((x) => [x.name, x.status])).toEqual([["Quay Café", "at risk"], ["Fish Co", "due"], ["Deli", "ok"]]);
    expect(r.atRiskValue).toBe(200);
    expect(r.chase).toBe(2);
  });
});

describe("catchMargins", () => {
  test("accounts for yield and finds the weakest line", () => {
    const r = catchMargins([
      { name: "Cod fillet", costPerKg: 6, yieldPct: 40, pricePerKg: 22 },
      { name: "Mackerel", costPerKg: 3, yieldPct: 100, pricePerKg: 6 },
    ]);
    expect(r.rows[0].trueCost).toBe(15);
    expect(r.rows[0].margin).toBe(7);
    expect(r.weakest!.name).toBe("Cod fillet");
  });
});

describe("instructorRota", () => {
  test("spreads shifts and shows gaps", () => {
    const r = instructorRota(
      [{ name: "Ana", days: ["Sat", "Sun"], maxDays: 5 }, { name: "Ben", days: ["Sat"], maxDays: 1 }, { name: "", days: ["Mon"], maxDays: 5 }],
      [1, 0, 0, 0, 0, 2, 2],
    );
    expect(r.days[5].on).toEqual(["Ana", "Ben"]);
    expect(r.days[6].on).toEqual(["Ana"]);
    expect(r.gaps.map((g) => [g.day, g.short])).toEqual([["Mon", 1], ["Sun", 1]]);
  });
});

describe("stockTurn", () => {
  test("ranks slow movers and the cash tied up", () => {
    const r = stockTurn([
      { name: "Ropes", stockValue: 1200, monthlySales: 100, leadWeeks: 2 },
      { name: "Bait", stockValue: 200, monthlySales: 400, leadWeeks: 1 },
    ]);
    expect(r.rows[0].name).toBe("Ropes");
    expect(r.rows[0].turns).toBe(1);
    expect(r.slowest.map((x) => x.name)).toEqual(["Ropes"]);
    expect(r.tiedUp).toBeGreaterThan(1000);
  });
});

describe("partnershipFit", () => {
  test("scores answers and lists questions, weakest first", () => {
    const r = partnershipFit({ values: "yes", practice: "no", evidence: "unsure", audience: "yes", aims: "yes", capacity: "yes", local: "yes", exit: "yes" });
    expect(r.score).toBe(81);
    expect(r.band).toBe("Strong fit");
    expect(r.ask.map((q) => q.key)).toEqual(["practice", "evidence"]);
    expect(r.redFlags.length).toBe(1);
  });
});

describe("impactPitch", () => {
  test("uses only what was entered and lists gaps", () => {
    const r = impactPitch({ project: "Seagrass Watch", org: "Bay Trust", problem: "", outcomes: "Map the meadow; Train 20 volunteers", audience: "sponsor", ask: "£2,000", timeframe: "Spring", measure: "" });
    expect(r.text).toContain("SEAGRASS WATCH · Bay Trust");
    expect(r.text).toContain("- Train 20 volunteers");
    expect(r.gaps).toEqual(["the problem it solves", "how you'll measure it"]);
  });
});

describe("eventBreakEven", () => {
  test("finds the break-even number and profit range", () => {
    const r = eventBreakEven({ fixed: 2000, price: 25, perHead: 5, feesPct: 0, capacity: 200, expected: 120 });
    expect(r.breakEven).toBe(100);
    expect(r.breakEvenPct).toBe(50);
    expect(r.range.expected.profit).toBe(400);
    expect(r.range.low).toEqual({ n: 90, profit: -200 });
    expect(r.range.sellOut!.profit).toBe(2000);
  });
});

describe("outreachMessages", () => {
  test("writes one message per partner type", () => {
    const r = outreachMessages({ event: "Harbour Food Festival", date: "6 June", place: "the quay", audience: "", gain: "a free stall", sender: "Mia", types: ["food", "media"] });
    expect(r.length).toBe(2);
    expect(r[0].text).toContain("We're running Harbour Food Festival on 6 June at the quay.");
    expect(r[1].text).toContain("Mia");
  });
});

describe("retainerProposal", () => {
  test("works out the hourly value and warns when it is low", () => {
    const r = retainerProposal({ client: "Marina", agency: "", services: "Social posts\nMonthly report", goals: "", hours: 20, fee: 800, term: 6, notice: 30, currency: "£", extraRate: 60 });
    expect(r.hourly).toBe(40);
    expect(r.warnings.length).toBe(2);
    expect(r.text).toContain("£800 a month, for a minimum of 6 months");
  });
});

describe("weatherPlan", () => {
  test("builds the timeline and customer message", () => {
    const r = weatherPlan({ business: "Cove Kayaks", services: "guided tours", decideHours: 12, triggers: "wind over 15 knots", fallbacks: ["Voucher for a later date"], channels: "text", refund: "", atRisk: 8 });
    expect(r.steps[0].when).toBe("36 hours before");
    expect(r.steps[1].what).toContain("wind over 15 knots");
    expect(r.message).toContain("- Voucher for a later date");
  });
});
