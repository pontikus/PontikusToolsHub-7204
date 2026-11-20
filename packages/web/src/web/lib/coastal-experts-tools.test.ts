import { describe, expect, test } from "bun:test";
import {
  addDays,
  clientBrief,
  commission,
  dayRate,
  daysBetween,
  deadlineList,
  followUps,
  intakeSheet,
  jobQuote,
  learnerProgress,
  riskRegister,
  riskRegisterText,
  routePlan,
  sessionFill,
  workloadYear,
} from "./coastal-experts-tools";

describe("dates", () => {
  test("counts and adds days", () => {
    expect(daysBetween("2026-11-20", "2026-12-01")).toBe(11);
    expect(daysBetween("bad", "2026-12-01")).toBeNull();
    expect(addDays("2026-11-20", -21)).toBe("2026-10-30");
  });
});

describe("deadlineList", () => {
  test("sorts by date and flags overdue and start-now items", () => {
    const r = deadlineList(
      [
        { date: "2027-03-01", item: "Insurance", forWhom: "Me", leadDays: 30 },
        { date: "2026-11-10", item: "Licence", forWhom: "Client", leadDays: 14 },
        { date: "2026-12-01", item: "Registration", forWhom: "Me", leadDays: 21 },
      ],
      "2026-11-20",
    );
    expect(r.map((x) => x.status)).toEqual(["overdue", "start", "upcoming"]);
    expect(r[1].startBy).toBe("2026-11-10");
  });
});

describe("intakeSheet", () => {
  test("lists held documents and asks about missing ones", () => {
    const r = intakeSheet({ client: "Harbour Ltd", contact: "", matterType: "Licensing", issue: "Mooring licence refused", jurisdiction: "England", deadline: "", documents: ["Correspondence"], otherParties: "" });
    expect(r.text).toContain("- Correspondence");
    expect(r.missing).toContain("Contract or agreement");
    expect(r.text).toContain("It is not advice.");
  });
});

describe("dayRate", () => {
  test("covers income and costs over billable days", () => {
    const r = dayRate({ income: 60000, overheads: 10000, travel: 2000, workingDays: 220, billablePct: 60, nichePct: 10 });
    expect(r.billableDays).toBe(132);
    expect(r.breakEven).toBeCloseTo(12000 / 132, 6);
    expect(r.rate).toBeCloseTo((72000 / 132) * 1.1, 6);
  });
});

describe("riskRegister", () => {
  test("ranks by likelihood × impact", () => {
    const rows = riskRegister([
      { name: "Storm damage", likelihood: 3, impact: 5 },
      { name: "", likelihood: 5, impact: 5 },
      { name: "Staff shortage", likelihood: 4, impact: 2 },
    ]);
    expect(rows.map((r) => [r.name, r.score, r.rating])).toEqual([
      ["Storm damage", 15, "Critical"],
      ["Staff shortage", 8, "Medium"],
    ]);
    expect(riskRegisterText("Marina", rows)).toContain("1. Storm damage: 15 (Critical)");
  });
});

describe("routePlan", () => {
  test("times each stop and flags a late finish", () => {
    const r = routePlan({ start: "08:00", stops: [{ name: "Island A", travelMin: 45, visitMin: 60 }, { name: "Cove B", travelMin: 30, visitMin: 45 }], returnMin: 60, finishBy: "11:30" });
    expect(r.legs.map((l) => [l.arrive, l.leave])).toEqual([[525, 585], [615, 660]]);
    expect(r.home).toBe(720);
    expect(r.late).toBe(30);
    expect(r.travel).toBe(135);
  });
});

describe("followUps", () => {
  test("sets the next date, flags overdue and totals the open pipeline", () => {
    const r = followUps(
      [
        { date: "2026-11-01", name: "Marina survey", stage: "Proposal sent", value: 5000, gapDays: 7 },
        { date: "2026-11-18", name: "Harbour audit", stage: "New enquiry", value: 2000, gapDays: 3 },
        { date: "2026-10-01", name: "Old job", stage: "Won", value: 9000, gapDays: 7 },
      ],
      "2026-11-20",
    );
    expect(r.pipeline).toBe(7000);
    expect(r.overdue).toBe(1);
    expect(r.rows[0]).toMatchObject({ name: "Marina survey", next: "2026-11-08", overdue: true });
    expect(r.rows[r.rows.length - 1].open).toBe(false);
  });
});

describe("commission", () => {
  test("takes splits, fees and costs off the gross", () => {
    const r = commission({ value: 200000, ratePct: 2, splits: [{ label: "Office", pct: 30 }, { label: "Referrer", pct: 0 }], fees: 100, costs: 300 });
    expect(r.gross).toBe(4000);
    expect(r.shared).toBe(1200);
    expect(r.net).toBe(2400);
    expect(r.splits.length).toBe(1);
    expect(r.keepPct).toBe(60);
  });
});

describe("clientBrief", () => {
  test("lists scope gaps and builds the brief", () => {
    const r = clientBrief(
      { client: "Port Co", goal: "Cut berth wait times", scope: "Review", deliverables: "Report; Workshop", exclusions: "", timeline: "", constraints: "", approver: "" },
      { deliverables: true, exclusions: false, acceptance: true, changes: true, dates: true, approver: false },
    );
    expect(r.gaps.length).toBe(2);
    expect(r.ready).toBe(false);
    expect(r.text).toContain("- Report\n- Workshop");
  });
});

describe("jobQuote", () => {
  test("prices to the margin and adds a contingency range", () => {
    const r = jobQuote({ materials: 1000, markupPct: 10, hours: 20, hourly: 40, travel: 100, marginPct: 20, riskItems: 200, contingency: "medium" });
    expect(r.cost).toBe(2000);
    expect(r.quote).toBe(2500);
    expect(r.marginAmount).toBe(500);
    expect(r.high).toBe(2500 + (400 + 200) / 0.8);
  });
});

describe("sessionFill", () => {
  test("ranks by seats needed per day left and dates the pushes", () => {
    const r = sessionFill(
      [
        { name: "Sea kayak basics", date: "2026-12-20", capacity: 10, booked: 8 },
        { name: "Navigation", date: "2026-11-28", capacity: 12, booked: 3 },
      ],
      "2026-11-20",
      80,
    );
    expect(r[0].name).toBe("Navigation");
    expect(r[0].need).toBe(7);
    expect(r[0].pushes.map((p) => p.date)).toEqual(["2026-11-21", "2026-11-26"]);
    expect(r[1].need).toBe(0);
  });
});

describe("learnerProgress", () => {
  test("shows each learner's progress and the least covered skill", () => {
    const r = learnerProgress(["Knots", "Rescue", "Navigation"], [{ name: "Ana", done: ["Knots", "Rescue"] }, { name: "Ben", done: ["Knots"] }]);
    expect(r.rows.map((x) => [x.name, x.pct, x.next])).toEqual([["Ben", 33, "Rescue"], ["Ana", 67, "Navigation"]]);
    expect(r.weakest!.skill).toBe("Navigation");
  });
});

describe("workloadYear", () => {
  test("finds quiet and overloaded months", () => {
    const r = workloadYear([5, 6, 12, 18, 22, 26, 26, 25, 18, 12, 6, 4], 20);
    expect(r.quiet.map((m) => m.i)).toEqual([0, 1, 10, 11]);
    expect(r.over.map((m) => m.i)).toEqual([4, 5, 6, 7]);
    expect(r.overDays).toBe(19);
    expect(r.quietDays).toBe(59);
  });
});
