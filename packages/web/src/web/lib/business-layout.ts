import QRCode from "qrcode";

export function httpsReviewError(value: string) {
  if (!value.trim()) return "Add your review link. An HTTPS URL is required.";
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname && !url.username && !url.password) return "";
  } catch { /* Invalid URLs are never encoded. */ }
  return "Use a valid HTTPS review link, starting with https://.";
}
export async function reviewQR(value: string) {
  const error = httpsReviewError(value);
  if (error) throw new Error(error);
  return QRCode.toDataURL(value.trim(), { errorCorrectionLevel: "M", margin: 4, width: 900 });
}
export function reversedRange(from: string, until: string) {
  return !!from && !!until && until < from;
}
export const socialSizes = [[1080, 1080], [1080, 1350], [1080, 1920]] as const;
export function socialSafeArea(height: number) {
  return height === 1920 ? { top: 250, bottom: height - 250 } : { top: 70, bottom: height - 100 };
}
export function paginateOffers<T extends { height: number }>(rows: T[], available = 1480) {
  const pages: T[][] = [[]];
  let used = 0;
  for (const row of rows) {
    if (used + row.height > available && pages[pages.length - 1].length) {
      pages.push([]); used = 0;
    }
    pages[pages.length - 1].push(row); used += row.height;
  }
  return pages;
}
export function businessLines(c: Pick<CanvasRenderingContext2D, "measureText">, value: string, width: number) {
  const result: string[] = [];
  let line = "";
  for (const char of value.replace(/\s+/g, " ").trim()) {
    if (line && c.measureText(line + char).width > width) {
      const space = line.lastIndexOf(" ");
      if (space > 0) { result.push(line.slice(0, space)); line = line.slice(space + 1) + char; }
      else { result.push(line); line = char; }
    } else line += char;
  }
  result.push(line);
  return result;
}