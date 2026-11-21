import { describe, expect, test } from "bun:test";
import { toneText } from "./tone";

const msg = "Hi Sam,\n\nWe're so glad you're coming! It's a short walk from the car park. Parking opens at 6.\n\n- Bring a towel\n- Bring water\n\nThanks,\nAlex";

describe("toneText", () => {
  test("friendly leaves the text alone", () => {
    expect(toneText(msg, "friendly")).toBe(msg);
  });
  test("formal expands contractions, swaps greeting and sign-off, drops exclamation marks", () => {
    const t = toneText(msg, "formal");
    expect(t.startsWith("Dear Sam,")).toBe(true);
    expect(t).toContain("We are so glad you are coming.");
    expect(t).toContain("It is a short walk");
    expect(t).toContain("Kind regards,\nAlex");
    expect(t).not.toContain("!");
  });
  test("short keeps the first sentence of body paragraphs and every list line", () => {
    const t = toneText(msg, "short");
    expect(t).toContain("We're so glad you're coming!");
    expect(t).not.toContain("short walk");
    expect(t).toContain("- Bring a towel\n- Bring water");
    expect(t.endsWith("Thanks,\nAlex")).toBe(true);
  });
});
