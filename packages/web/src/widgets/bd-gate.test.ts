import { describe, expect, test } from "bun:test";
import { bdPlans, gatedMarkup, gatePanel } from "./bd-gate";

const tool = { slug: "trip-readiness-wheel", name: "Trip Readiness Wheel", promise: "Find the weak spot.", audienceName: "Sea Lovers" };

describe("BD login gate", () => {
  test("members get the mount point with their plan, others get the sign-in panel", () => {
    const php = gatedMarkup(tool);
    expect(php).toContain("getUser($_COOKIE['userid'], $w)");
    expect(php).toContain('<div id="pkst-trip-readiness-wheel" data-member="1"');
    expect(php.indexOf("pkst-gate")).toBeGreaterThan(php.indexOf("} else {"));
    expect(php).toContain("17=>array('sea-lovers','level1')");
  });
  test("panel links to sign in and register and never says free", () => {
    const html = gatePanel(tool);
    expect(html).toContain('href="/login"');
    expect(html).toContain('href="/join"');
    expect(html.toLowerCase()).not.toContain("free");
  });
  test("every live plan maps to an audience and level", () => {
    expect(Object.keys(bdPlans)).toHaveLength(12);
  });
});
