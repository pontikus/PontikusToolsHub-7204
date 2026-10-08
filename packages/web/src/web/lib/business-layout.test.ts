import { describe, expect, test, mock } from "bun:test";
import QRCode from "qrcode";
import { businessLines, httpsReviewError, reviewQR, reversedRange, paginateOffers, socialSafeArea } from "./business-layout";
mock.module("./asset", () => ({ asset: (path: string) => `/test/${path}`, routerBase: "/test" }));
const { businessBox } = await import("./business-canvas");

describe("Shoreline Business layout and validation", () => {
  test("only HTTPS review URLs are accepted", () => {
    for (const value of ["", "[YOUR LINK]", "http://example.com", "javascript:alert(1)", "ftp://example.com", "https://", "https://user:password@example.com"])
      expect(httpsReviewError(value)).not.toBe("");
    expect(httpsReviewError("https://example.com/review?business=coast")).toBe("");
  });
  test("QR uses the exact review URL as its text", async () => {
    const url = "https://example.com/reviews?place=coast&language=en";
    const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
    expect(new TextDecoder().decode((qr.segments[0] as { data: Uint8Array }).data)).toBe(url);
    expect(await reviewQR(url)).toBe(await QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 4, width: 900 }));
    await expect(reviewQR("http://example.com")).rejects.toThrow("HTTPS");
  });
  test("date and time ranges warn only when reversed", () => {
    expect(reversedRange("18:30", "17:00")).toBe(true);
    expect(reversedRange("2026-10-10", "2026-10-09")).toBe(true);
    expect(reversedRange("2026-10-09", "2026-10-10")).toBe(false);
    expect(reversedRange("18:30", "18:30")).toBe(false);
    expect(reversedRange("", "18:30")).toBe(false);
  });
  test("offer rows overflow onto a second page without losing entries", () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({ height: 230, i }));
    const pages = paginateOffers(rows);
    expect(pages).toHaveLength(2);
    expect(pages.flat()).toEqual(rows);
    for (const page of pages) expect(page.reduce((a, b) => a + b.height, 0)).toBeLessThanOrEqual(1480);
    expect(paginateOffers([{ height: 154 }])).toHaveLength(1);
  });
  test("story exclusion zones are exactly 250px", () => {
    expect(socialSafeArea(1920)).toEqual({ top: 250, bottom: 1670 });
  });
  test("maximum-length text is fitted within each tool’s smallest boxes", () => {
    let font = "", clip = [0, 0, 0, 0], painted = 0;
    const c = {
      get font() { return font; }, set font(v: string) { font = v; },
      measureText: (value: string) => ({ width: value.length * parseFloat(font) * .7 }),
      save() {}, restore() {}, beginPath() {}, rect(x: number, y: number, w: number, h: number) { clip = [x, y, w, h]; }, clip() {},
      fillText(value: string, x: number, y: number) {
        expect(x).toBeGreaterThanOrEqual(clip[0]);
        expect(y).toBeLessThanOrEqual(clip[1] + clip[3]);
        expect(value.length * parseFloat(font) * .7).toBeLessThanOrEqual(clip[2]); painted++;
      },
    } as unknown as CanvasRenderingContext2D;
    // Review URL/short line, event, offer note, job requirements/bio, notice and social.
    for (const [limit, width, height, size] of [[2048, 1091, 118, 23], [120, 1091, 148, 36], [240, 950, 155, 30], [70, 1170, 61, 32], [360, 950, 243, 30], [90, 950, 44, 27], [400, 950, 364, 39], [120, 950, 109, 35], [60, 950, 200, 76]]) {
      for (const value of ["W".repeat(limit), "words ".repeat(limit).slice(0, limit), "\n".repeat(limit)])
        businessBox(c, value, 10, 20, width, height, size);
    }
    expect(painted).toBeGreaterThan(0);
    c.font = "20px Archivo";
    expect(businessLines(c, "W".repeat(400), 100).join("")).toBe("W".repeat(400));
  });
});