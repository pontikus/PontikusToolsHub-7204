import { describe, expect, test } from "bun:test";
import { diveLonger, quoteLonger, riskLonger, welcomeLonger } from "./longer-formats";

describe("longer formats", () => {
  test("dive briefing uses freedive rules and the shore contact", () => {
    const [brief, msg] = diveLonger({ kind: "freedive", spot: "North Cove", date: "2026-06-01", entry: "10:00", maxDepth: 8, minutes: 45, buddy: "Sam", buddyPhone: "", shoreContact: "Alex Jones" });
    expect(brief.text).toContain("One up, one down");
    expect(brief.text).toContain("Alex Jones");
    expect(msg.text.startsWith("Hi Alex,")).toBe(true);
  });
  test("risk report lists every risk with a review cycle by score", () => {
    const [r] = riskLonger("Bay Cafe", [
      { name: "Flood", likelihood: 4, impact: 5, score: 20, rating: "High" },
      { name: "Staff", likelihood: 2, impact: 2, score: 4, rating: "Low" },
    ]);
    expect(r.text).toContain("1. Flood");
    expect(r.text).toContain("Review monthly");
    expect(r.text).toContain("Review every six months");
    expect(riskLonger("x", [])).toEqual([]);
  });
  test("quote email carries total, deposit and hold period", () => {
    const [mail] = quoteLonger({ business: "Bay Boats", client: "Jo", date: "2026-07-01", route: "", groupSize: 12, depositPct: 25, validDays: 14, currency: "£" }, 1200, 300);
    expect(mail.text).toContain("Total: £1,200");
    expect(mail.text).toContain("£300 (25%)");
    expect(mail.text).toContain("held for 14 days");
  });
  test("welcome sequence has three messages and falls back on blanks", () => {
    const out = welcomeLonger({ property: "", guest: "", arrival: "", checkIn: "15:00", checkOut: "10:00", host: "", contact: "" });
    expect(out.length).toBe(3);
    expect(out[0].text.startsWith("Hi there,")).toBe(true);
  });
});
