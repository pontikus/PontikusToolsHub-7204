import { beginCanvas, drawFrame, cover, loadImage, NAVY, CREAM, GOLD } from "./canvas-utils";
import { businessLines, httpsReviewError, reviewQR, paginateOffers, socialSafeArea, socialSizes } from "./business-layout";

export type OfferRow = { name: string; note: string; price: string };
export type BusinessData = {
  kind: string; business: string; headline: string; supporting: string; url: string;
  photo: string; format: string; style: string; removeFrame: boolean;
  date: string; start: string; end: string; venue: string; description: string;
  price: string; contact: string; currency: string; valid: string; rows: OfferRow[];
  location: string; jobType: string; requirements: string[]; closing: string;
  noticeType: string; from: string; until: string; cta: string;
};

// Every text field is measured, shrunk and clipped in its own reserved rectangle.
export function businessBox(c: CanvasRenderingContext2D, text: string, x: number, y: number,
  width: number, height: number, size = 36, family = "Archivo") {
  let output: string[] = [], font = size;
  while (font >= 4) {
    c.font = `${font}px ${family}`;
    output = businessLines(c, text, width);
    if (output.length * font * 1.3 <= height) break;
    font--;
  }
  c.save(); c.beginPath(); c.rect(x, y, width, height); c.clip();
  c.font = `${font}px ${family}`;
  output.forEach((line, i) => c.fillText(line, x, y + font + i * font * 1.3));
  c.restore();
}
async function start(data: BusinessData, w: number, h: number) {
  const canvas = document.createElement("canvas");
  const dark = data.style === "navy";
  const c = await beginCanvas(canvas, w, h, dark ? NAVY : data.style === "minimal" ? "#fff" : CREAM);
  const ink = dark ? CREAM : NAVY;
  const accent = dark ? GOLD : "#79602a";
  const m = w * .06, inner = w - m * 2;
  const text = (value: string, y: number, height: number, size = w * .029, display = false) => {
    c.fillStyle = ink; businessBox(c, value, m, y, inner, height, size, display ? "Fraunces" : "Archivo");
  };
  const label = (value: string, y: number, height = h * .035) => {
    c.fillStyle = accent; businessBox(c, value, m, y, inner, height, w * .018, '"IBM Plex Mono"');
  };
  const rule = (y: number) => { c.fillStyle = accent; c.fillRect(m, y, inner, 2); };
  return { canvas, c, m, inner, text, label, rule, ink };
}
function dimensions(data: BusinessData): [number, number] {
  return data.format === "social" ? [1080, 1350] : data.format === "a6" ? [1240, 1748] : [1748, 2480];
}
export function businessPaper(format: string): [number, number] {
  return format === "social" ? [216, 270] : format === "a6" ? [105, 148] : [210, 297];
}
async function image(data: BusinessData, c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  if (data.photo) cover(c, await loadImage(data.photo), x, y, w, h);
}
export async function renderReview(data: BusinessData) {
  const [w, h] = dimensions(data);
  const { canvas, c, m, text, label } = await start(data, w, h);
  label("CUSTOMER REVIEWS", h * .045);
  text(data.business, h * .095, h * .08, w * .044, true);
  text(data.headline, h * .20, h * .14, w * .065, true);
  text(data.supporting, h * .36, h * .085);
  const error = httpsReviewError(data.url);
  const qrSize = Math.min(w * .48, h * .34), qrY = h * .47;
  if (!error) {
    const qr = await loadImage(await reviewQR(data.url));
    c.imageSmoothingEnabled = false;
    c.drawImage(qr, (w - qrSize) / 2, qrY, qrSize, qrSize);
  } else text("[ADD YOUR HTTPS REVIEW LINK]", qrY + qrSize / 3, qrSize / 3, w * .03);
  if (data.photo) {
    const logo = await loadImage(data.photo), side = w * .11;
    const scale = Math.min(side / logo.width, side / logo.height);
    c.drawImage(logo, m, qrY, logo.width * scale, logo.height * scale);
  }
  label("Scan to leave a review", h * .825);
  text(data.url || "[YOUR HTTPS REVIEW LINK]", h * .87, h * .068, w * .019);
  await drawFrame(c, w, h, data.removeFrame); return [canvas];
}
export async function renderEvent(data: BusinessData) {
  const [w, h] = dimensions(data);
  const { canvas, c, m, inner, text, label, rule } = await start(data, w, h);
  label("WHAT’S ON", h * .04);
  text(data.headline, h * .105, h * .16, w * .073, true);
  label(`${data.date || "[DATE]"} · ${data.start || "[START TIME]"} — ${data.end || "[END TIME]"}`, h * .285, h * .055);
  text(data.venue, h * .35, h * .08, w * .04);
  rule(h * .445);
  if (data.photo) await image(data, c, m, h * .475, inner, h * .205);
  text(data.description, h * (data.photo ? .70 : .49), h * (data.photo ? .115 : .30), w * .028);
  label(data.price, h * .83, h * .045);
  text(data.contact, h * .885, h * .06, w * .025);
  await drawFrame(c, w, h, data.removeFrame); return [canvas];
}
export async function renderOffer(data: BusinessData) {
  const measure = document.createElement("canvas").getContext("2d")!;
  await beginCanvas(measure.canvas, 1748, 2480);
  measure.font = "40px Archivo";
  const rows = data.rows.map(row => ({ row, height: Math.max(154, Math.min(230,
    businessLines(measure, row.name, 1170).length * 52 + businessLines(measure, row.note, 1170).length * 43 + 35)) }));
  const chunks = paginateOffers(rows);
  return Promise.all(chunks.map(async (chunk, index) => {
    const { canvas, c, m, inner, text, label, rule, ink } = await start(data, 1748, 2480);
    label(`OFFERS / ${index + 1} OF ${chunks.length}`, 90);
    text(data.headline, 240, 230, 110, true);
    label(`PRICES IN ${data.currency}`, 510);
    rule(620);
    let y = 660;
    chunk.forEach(({ row, height }) => {
      c.fillStyle = ink;
      businessBox(c, row.name, m, y, 1170, height * .44, 43, "Fraunces");
      businessBox(c, row.note, m, y + height * .47, 1170, height * .4, 32);
      businessBox(c, `${data.currency} ${row.price}`, m + 1210, y, inner - 1210, height * .8, 36);
      rule(y + height - 12); y += height;
    });
    if (data.valid) label(`Valid until ${data.valid}`, 2210);
    await drawFrame(c, 1748, 2480, data.removeFrame); return canvas;
  }));
}
export async function renderJob(data: BusinessData) {
  const [w, h] = dimensions(data);
  const { canvas, c, text, label, rule } = await start(data, w, h);
  label(data.business, h * .04);
  text(data.headline, h * .10, h * .14, w * .07, true);
  text(data.location, h * .255, h * .065, w * .033);
  label(`${data.jobType} · Start: ${data.start || "[START DATE]"}`, h * .33, h * .05);
  rule(h * .395);
  text(data.description, h * .42, h * .18, w * .028);
  label("REQUIREMENTS", h * .625);
  data.requirements.forEach((req, i) => text(`• ${req}`, h * (.67 + i * .037), h * .033, w * .025));
  text(data.contact, h * .865, h * .05, w * .027);
  if (data.closing) label(`Apply by ${data.closing}`, h * .927, h * .025);
  await drawFrame(c, w, h, data.removeFrame); return [canvas];
}
export async function renderNotice(data: BusinessData) {
  const [w, h] = dimensions(data);
  const { canvas, c, text, label, rule } = await start(data, w, h);
  label(`CUSTOMER UPDATE / ${data.noticeType.toUpperCase()}`, h * .045);
  text(data.headline, h * .14, h * .18, w * .07, true);
  label(`${data.from || "[FROM DATE]"} — ${data.until || "[UNTIL DATE]"}`, h * .355, h * .05);
  rule(h * .43);
  text(data.description, h * .48, h * .27, w * .036);
  text(data.contact, h * .785, h * .07, w * .027);
  text(`Notice issued by ${data.business || "[business name]"}. Not an official harbour authority or safety notice.`, h * .88, h * .065, w * .021);
  await drawFrame(c, w, h, data.removeFrame); return [canvas];
}
export async function renderSocial(data: BusinessData) {
  return Promise.all(socialSizes.map(async ([w, h]) => {
    const { canvas, c, m, inner, text, label, rule } = await start(data, w, h);
    const { top, bottom } = socialSafeArea(h), space = bottom - top - (h === 1920 ? 65 : 0);
    label(data.business, top, space * .065);
    text(data.headline, top + space * .10, space * .22, 76, true);
    rule(top + space * .355);
    if (data.photo) await image(data, c, m, top + space * .39, inner, space * .29);
    text(data.supporting, top + space * (data.photo ? .715 : .43), space * (data.photo ? .12 : .29), 35);
    text(data.cta, top + space * .875, space * .095, 37, true);
    await drawFrame(c, w, h === 1920 ? bottom : h, data.removeFrame); return canvas;
  }));
}
export const businessRenderers = { "review-poster": renderReview, "event-flyer": renderEvent,
  "offer-board": renderOffer, "job-post": renderJob, notice: renderNotice, "social-kit": renderSocial };