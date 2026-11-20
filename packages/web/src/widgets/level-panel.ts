// Levels 1-3 for the plain-DOM tools. Each tool hands over its live state and a few hooks;
// this panel adds what the member's level unlocks: saved versions and a shareable summary
// (Level 1), compare, print/PDF and file exports (Level 2), and branding, own defaults and
// own fields (Level 3). Everything is kept in this browser; nothing is uploaded.
import { levelLabel, levelOrder, type LevelKey, type ToolType } from "../web/lib/levels";
import { esc } from "./core";

export const atLeast = (level: LevelKey, min: LevelKey) => levelOrder.indexOf(level) >= levelOrder.indexOf(min);

// ---------- storage ----------
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
export function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ---------- files ----------
export function download(doc: Document, filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = doc.createElement("a");
  a.href = url;
  a.download = filename;
  doc.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const fileName = (name: string, ext: string) => `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "pontikus"}.${ext}`;

export function csvText(rows: (string | number)[][]) {
  return rows.map((r) => r.map((c) => (/[",\n]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : String(c))).join(",")).join("\r\n");
}

export type CalEvent = { date: string; time?: string; minutes?: number; title: string; description?: string; remindDays?: number };
const icsEsc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
export function icsText(events: CalEvent[], stamp = new Date()) {
  const dt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const out = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Pontikus//Boatyard//EN", "CALSCALE:GREGORIAN"];
  events
    .filter((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date))
    .forEach((e, i) => {
      const day = e.date.replace(/-/g, "");
      out.push("BEGIN:VEVENT", `UID:${day}-${i}-${dt(stamp)}@pontikus.com`, `DTSTAMP:${dt(stamp)}`);
      if (e.time && /^\d{2}:\d{2}$/.test(e.time)) {
        const start = `${day}T${e.time.replace(":", "")}00`;
        const end = new Date(`${e.date}T${e.time}:00`);
        end.setMinutes(end.getMinutes() + (e.minutes ?? 60));
        const pad = (n: number) => String(n).padStart(2, "0");
        out.push(`DTSTART:${start}`, `DTEND:${end.getFullYear()}${pad(end.getMonth() + 1)}${pad(end.getDate())}T${pad(end.getHours())}${pad(end.getMinutes())}00`);
      } else {
        const next = new Date(`${e.date}T12:00:00Z`);
        next.setUTCDate(next.getUTCDate() + 1);
        out.push(`DTSTART;VALUE=DATE:${day}`, `DTEND;VALUE=DATE:${next.toISOString().slice(0, 10).replace(/-/g, "")}`);
      }
      out.push(`SUMMARY:${icsEsc(e.title)}`);
      if (e.description) out.push(`DESCRIPTION:${icsEsc(e.description)}`);
      if (e.remindDays !== undefined) out.push("BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${icsEsc(e.title)}`, `TRIGGER:-P${Math.max(0, Math.round(e.remindDays))}D`, "END:VALARM");
      out.push("END:VEVENT");
    });
  out.push("END:VCALENDAR");
  return out.join("\r\n");
}

// ---------- branding (Level 3) ----------
export type Brand = { name: string; colour: string; logo: string };
const BRAND_KEY = "pkst-brand";
export const loadBrand = (): Brand => ({ name: "", colour: "#0b1f3b", logo: "", ...readJson<Partial<Brand>>(BRAND_KEY, {}) });

function brandHeader(brand: Brand | null) {
  if (!brand || (!brand.name && !brand.logo)) return "";
  return `<div style="display:flex;align-items:center;gap:14px;border-bottom:3px solid ${esc(brand.colour)};padding-bottom:10px;margin-bottom:18px">${
    brand.logo ? `<img src="${esc(brand.logo)}" alt="" style="max-height:56px;max-width:180px">` : ""
  }${brand.name ? `<strong style="font-size:20px;color:${esc(brand.colour)}">${esc(brand.name)}</strong>` : ""}</div>`;
}

export function reportHtml(o: { title: string; body: string; brand: Brand | null; tool: string }) {
  const accent = o.brand?.colour || "#0b1f3b";
  return `${brandHeader(o.brand)}<h1 style="font:400 26px Georgia,serif;color:${esc(accent)};margin:0 0 4px">${esc(o.title)}</h1>
    <p style="font:12px monospace;color:#586474;margin:0 0 18px">${esc(o.tool)} · ${esc(new Date().toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }))}</p>
    ${o.body}
    <p style="font:11px monospace;color:#8a8a80;margin-top:28px">Made with the Pontikus Boatyard</p>`;
}

// Prints only the report: a top-level container shown by print CSS, hidden on screen.
export function printReport(doc: Document, html: string) {
  let box = doc.getElementById("pkst-print");
  if (!box) {
    box = doc.createElement("div");
    box.id = "pkst-print";
    doc.body.appendChild(box);
    const style = doc.createElement("style");
    style.textContent = `#pkst-print{display:none}
@media print{body>*:not(#pkst-print){display:none !important}#pkst-print{display:block !important;font:14px/1.6 Arial,sans-serif;color:#0b1f3b;padding:12mm}
#pkst-print pre{white-space:pre-wrap;font:13px/1.6 Arial,sans-serif}#pkst-print table{border-collapse:collapse;width:100%}#pkst-print td,#pkst-print th{border:1px solid #ccc;padding:6px 8px;text-align:left}}`;
    doc.head.appendChild(style);
  }
  box.innerHTML = html;
  doc.defaultView?.print();
}

export function wordDoc(title: string, html: string) {
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(title)}</title></head><body style="font-family:Arial,sans-serif">${html}</body></html>`;
}

// ---------- reading a rendered result ----------
const BLOCK = /^(P|DIV|LI|H[1-6]|UL|OL|PRE|TABLE|TR|SECTION|DL|DT|DD)$/;
// Plain text of a result area for copy, print and documents. Leaves out buttons and notes.
export function textOf(el: Element): string {
  const out: string[] = [];
  const walk = (n: Node) => {
    if (n.nodeType === 3) return void out.push((n.textContent ?? "").replace(/\s+/g, " "));
    if (n.nodeType !== 1) return;
    const e = n as HTMLElement;
    if (e.tagName === "BUTTON" || e.tagName === "SCRIPT" || e.tagName === "STYLE" || e.classList.contains("pkst-note") || e.getAttribute("aria-hidden") === "true") return;
    if (e.tagName === "INPUT") {
      const i = e as HTMLInputElement;
      if (i.type === "checkbox") out.push(i.checked ? "[x] " : "[ ] ");
      return;
    }
    const block = BLOCK.test(e.tagName);
    if (block) out.push("\n");
    if (e.tagName === "LI" && !e.querySelector("input[type=checkbox]")) out.push("- ");
    if (e.tagName === "PRE") out.push(e.textContent ?? "");
    else e.childNodes.forEach(walk);
    if (e.tagName === "TD" || e.tagName === "TH") out.push("  ");
    if (block) out.push("\n");
  };
  walk(el);
  return out
    .join("")
    .split("\n")
    .map((l) => l.replace(/[ \t]+/g, " ").trim())
    .filter((l, i, a) => l || (i > 0 && a[i - 1]))
    .join("\n")
    .trim();
}

const num = (t: string) => {
  const m = t.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : NaN;
};
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
// Key numbers read from a rendered result: the big score and any labelled bars.
export function domMetrics(el: Element): Metric[] {
  const out: Metric[] = [];
  el.querySelectorAll(".pkst-score strong").forEach((s, i) => {
    const v = num(s.textContent ?? "");
    if (Number.isNaN(v)) return;
    let label = "";
    for (let p = s.closest(".pkst-score")?.previousElementSibling; p && !label; p = p.previousElementSibling) if (p.classList.contains("pkst-eyebrow")) label = cap(p.textContent ?? "");
    out.push([label || (i ? `Result ${i + 1}` : "Result"), v, (s.textContent ?? "").trim()]);
  });
  el.querySelectorAll(".pkst-bars li").forEach((li) => {
    const spans = li.querySelectorAll(":scope > span");
    const label = (spans[0]?.textContent ?? "").trim();
    const shown = (spans[spans.length - 1]?.textContent ?? "").trim();
    let v = num(shown);
    if (Number.isNaN(v)) v = parseFloat((li.querySelector("i") as HTMLElement | null)?.style.width ?? "");
    if (label && !Number.isNaN(v)) out.push([label, v, Number.isNaN(num(shown)) ? String(v) : shown]);
  });
  return out;
}

// ---------- the panel ----------
export type Metric = [label: string, value: number, shown?: string];
export type LevelHooks = {
  slug: string;
  name: string;
  audience: string;
  type: ToolType;
  // Live state the tool renders from. Saved versions are deep copies of it.
  state: Record<string, unknown>;
  // Put a saved state back into the form and re-render.
  restore: (saved: Record<string, unknown>) => void;
  // Plain text of the current result, for copy and documents.
  summary: () => string;
  // Key numbers for compare and charts, worked out from any state (current or saved).
  metrics?: (state: Record<string, unknown>) => Metric[];
  // Rows for spreadsheet export (first row is the header).
  csv?: () => (string | number)[][];
  // Dated items for calendar export and reminders.
  events?: () => CalEvent[];
  // Extra Level 3 content the tool draws (custom items and questions).
  custom?: { html: () => string; bind?: (box: HTMLElement, refresh: () => void) => void };
  // Hide saving/compare for tools whose state is already a saved list (trackers).
  noVersions?: boolean;
};

const NOUN: Record<ToolType, string> = {
  Assessment: "result",
  Calculator: "scenario",
  Planner: "plan",
  Checker: "checklist",
  Generator: "draft",
  Maker: "design",
  Tracker: "log",
};

type Version = { name: string; at: string; state: Record<string, unknown>; m?: Metric[] };
type Field = { label: string; value: string };

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function levelPanel(root: HTMLElement, level: LevelKey, h: LevelHooks) {
  if (level === "starter") return { refresh: () => {}, text: h.summary, destroy: () => {} };
  const doc = root.ownerDocument;
  const noun = NOUN[h.type];
  const vKey = `pkst-v-${h.slug}`;
  const dKey = `pkst-def-${h.slug}`;
  const fKey = `pkst-fields-${h.slug}`;
  const l2 = atLeast(level, "level2");
  const l3 = atLeast(level, "level3");
  let note = "";
  let compare = new Set<number>();
  let brandOpen = false;

  // Level 3: start from the member's own defaults.
  if (l3) {
    const def = readJson<Record<string, unknown> | null>(dKey, null);
    if (def) h.restore(def);
  }

  const versions = () => readJson<Version[]>(vKey, []);
  const fields = () => (l3 ? readJson<Field[]>(fKey, []) : []);
  const fullText = () => {
    const extra = fields().filter((f) => f.label.trim() || f.value.trim());
    return h.summary() + (extra.length ? `\n\n${extra.map((f) => `${f.label}: ${f.value}`).join("\n")}` : "");
  };

  const box = doc.createElement("section");
  box.className = "pkst-levels";
  box.setAttribute("aria-label", `${levelLabel(h.audience, level)} features`);
  root.querySelector(".pkst-columns")!.insertAdjacentElement("afterend", box);

  const metricsTable = () => {
    if (!h.metrics) return "";
    const list = versions();
    const cols: { name: string; m: Metric[] }[] = [{ name: "This one", m: h.metrics(h.state) }];
    [...compare].forEach((i) => {
      const v = list[i];
      if (v) cols.push({ name: v.name, m: v.m ?? h.metrics!({ ...clone(h.state), ...clone(v.state) }) });
    });
    if (cols.length < 2) return `<p class="pkst-note">Tick up to three saved ${noun}s to compare them side by side.</p>`;
    const rows = cols[0].m
      .map((row, r) => {
        const vals = cols.map((c) => c.m[r]?.[1] ?? 0);
        const max = Math.max(1e-9, ...vals.map((v) => Math.abs(v)));
        return `<tr><th scope="row">${esc(row[0])}</th>${cols
          .map((c) => {
            const m = c.m[r];
            const pct = m ? Math.round((Math.abs(m[1]) / max) * 100) : 0;
            return `<td><span>${esc(m?.[2] ?? String(m?.[1] ?? ""))}</span><i class="pkst-cbar" style="width:${pct}%"></i></td>`;
          })
          .join("")}</tr>`;
      })
      .join("");
    return `<div class="pkst-compare"><table><thead><tr><th></th>${cols.map((c) => `<th scope="col">${esc(c.name)}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div>`;
  };

  const draw = () => {
    const list = versions();
    const brand = loadBrand();
    const extra = fields();
    box.innerHTML = `<div class="pkst-levels-head"><p class="pkst-eyebrow">${esc(levelLabel(h.audience, level).toUpperCase())} · YOUR TOOLS</p>
        ${note ? `<p class="pkst-note" role="status">${esc(note)}</p>` : ""}</div>
      <div class="pkst-levels-grid">
        ${
          h.noVersions
            ? ""
            : `<div class="pkst-lv-card"><h4>Saved ${noun}s</h4>
          <div class="pkst-lv-row"><input type="text" maxlength="40" data-lv="name" placeholder="Name this ${noun}" aria-label="Name for this ${noun}"><button type="button" class="pkst-small" data-lv-act="save">Save</button></div>
          ${
            list.length
              ? `<ul class="pkst-lv-list">${list
                  .map(
                    (v, i) => `<li>${l2 && h.metrics ? `<label class="pkst-lv-tick"><input type="checkbox" data-lv-cmp="${i}"${compare.has(i) ? " checked" : ""} aria-label="Compare ${esc(v.name)}"></label>` : ""}<span><b>${esc(v.name)}</b> · ${esc(new Date(v.at).toLocaleDateString(undefined, { day: "numeric", month: "short" }))}</span>
                  <span><button type="button" class="pkst-small" data-lv-act="load" data-i="${i}">Load</button> <button type="button" class="pkst-small" data-lv-act="del" data-i="${i}">Delete</button></span></li>`,
                  )
                  .join("")}</ul>`
              : `<p class="pkst-note">Nothing saved yet. Saved ${noun}s stay in this browser.</p>`
          }</div>`
        }
        <div class="pkst-lv-card"><h4>Share and export</h4>
          <div class="pkst-lv-actions">
            <button type="button" class="pkst-small" data-lv-act="copy">Copy summary</button>
            ${h.events && h.events().length ? `<button type="button" class="pkst-small" data-lv-act="ics">${l2 ? "Add to calendar" : "Calendar reminders"}</button>` : ""}
            ${l2 ? `<button type="button" class="pkst-small" data-lv-act="print">Print or save as PDF</button>` : ""}
            ${l2 && h.csv ? `<button type="button" class="pkst-small" data-lv-act="csv">Spreadsheet (CSV)</button>` : ""}
            ${l2 && h.type === "Generator" ? `<button type="button" class="pkst-small" data-lv-act="doc">Word document</button>` : ""}
          </div>
          ${l2 ? "" : `<p class="pkst-note">Print, PDF${h.csv ? ", spreadsheet" : ""} and side-by-side compare come with Level 2.</p>`}
        </div>
        ${l2 && h.metrics && !h.noVersions ? `<div class="pkst-lv-card pkst-lv-wide"><h4>Compare</h4><div data-lv-compare>${metricsTable()}</div></div>` : ""}
        ${
          l3
            ? `<div class="pkst-lv-card"><h4>Your own fields</h4>
          <p class="pkst-hint">Added to the summary, PDF and document.</p>
          ${[0, 1, 2, 3]
            .map((i) => `<div class="pkst-lv-row"><input type="text" maxlength="30" data-lv-fl="${i}" value="${esc(extra[i]?.label ?? "")}" placeholder="Label" aria-label="Field ${i + 1} label"><input type="text" maxlength="80" data-lv-fv="${i}" value="${esc(extra[i]?.value ?? "")}" placeholder="Value" aria-label="Field ${i + 1} value"></div>`)
            .join("")}
          ${h.noVersions ? "" : `<div class="pkst-lv-actions"><button type="button" class="pkst-small" data-lv-act="def">Make these inputs my starting point</button>${readJson(dKey, null) ? `<button type="button" class="pkst-small" data-lv-act="undef">Clear my starting point</button>` : ""}</div>`}
          ${h.custom ? `<div data-lv-custom>${h.custom.html()}</div>` : ""}
        </div>
        <div class="pkst-lv-card"><h4>Your branding</h4>
          ${
            brandOpen
              ? `<label class="pkst-field"><span class="pkst-label">Business name</span><input type="text" maxlength="60" data-lv-b="name" value="${esc(brand.name)}"></label>
            <label class="pkst-field"><span class="pkst-label">Colour</span><input type="color" data-lv-b="colour" value="${esc(brand.colour)}"></label>
            <label class="pkst-field"><span class="pkst-label">Logo (PNG or JPG, under 300 KB)</span><input type="file" accept="image/png,image/jpeg" data-lv-b="logo"></label>
            ${brand.logo ? `<img src="${esc(brand.logo)}" alt="Your logo" style="max-height:48px;max-width:160px"> <button type="button" class="pkst-small" data-lv-act="nologo">Remove logo</button>` : ""}`
              : `<p>${brand.name || brand.logo ? `Using ${esc(brand.name || "your logo")} on your PDFs and documents.` : "Add your name, colour and logo to every PDF and document."}</p>`
          }
          <div class="pkst-lv-actions"><button type="button" class="pkst-small" data-lv-act="brand">${brandOpen ? "Done" : "Set up branding"}</button></div>
          <p class="pkst-note">Your branding is used by every Boatyard tool in this browser. Embedding tools on your own site and sharing with your team are coming soon.</p>
        </div>`
            : ""
        }
      </div>
      <p class="pkst-note">Saved ${noun}s, settings and branding stay in this browser on this device.</p>`;
    if (h.custom?.bind) {
      const c = box.querySelector<HTMLElement>("[data-lv-custom]");
      if (c) h.custom.bind(c, () => h.restore(h.state));
    }
  };

  const report = () => {
    const extra = fields().filter((f) => f.label.trim() || f.value.trim());
    const table = h.metrics ? metricsTable() : "";
    const body = `<pre>${esc(h.summary())}</pre>${extra.length ? `<table>${extra.map((f) => `<tr><th>${esc(f.label)}</th><td>${esc(f.value)}</td></tr>`).join("")}</table>` : ""}${
      compare.size && table.includes("<table") ? `<h2 style="font:400 18px Georgia,serif">Compared</h2>${table.replace(/<i class="pkst-cbar"[^>]*><\/i>/g, "")}` : ""
    }`;
    return reportHtml({ title: h.name, body, brand: l3 ? loadBrand() : null, tool: `Pontikus ${h.name}` });
  };

  const say = (text: string) => {
    note = text;
    draw();
  };

  const onClick = (e: Event) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-lv-act]");
    if (!btn || !box.contains(btn)) return;
    const act = btn.dataset.lvAct;
    const list = versions();
    if (act === "save") {
      const input = box.querySelector<HTMLInputElement>('input[data-lv="name"]');
      const name = input?.value.trim() || `${noun[0].toUpperCase()}${noun.slice(1)} ${list.length + 1}`;
      const ok = writeJson(vKey, [{ name, at: new Date().toISOString(), state: clone(h.state), m: h.metrics?.(h.state) }, ...list].slice(0, 50));
      compare = new Set([...compare].map((i) => i + 1));
      say(ok ? `Saved “${name}” in this browser.` : "This browser is blocking storage, so it could not be saved.");
    } else if (act === "load") {
      const v = list[Number(btn.dataset.i)];
      if (v) h.restore(clone(v.state));
      say(v ? `Loaded “${v.name}”.` : "");
    } else if (act === "del") {
      const i = Number(btn.dataset.i);
      list.splice(i, 1);
      writeJson(vKey, list);
      compare = new Set([...compare].filter((x) => x !== i).map((x) => (x > i ? x - 1 : x)));
      say("Deleted.");
    } else if (act === "copy") {
      const text = fullText();
      const done = (ok: boolean) => say(ok ? "Summary copied. Paste it into a message or email." : "Copying is blocked here. Select the text in the result and copy it.");
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
      else done(false);
    } else if (act === "ics" && h.events) {
      download(doc, fileName(h.name, "ics"), "text/calendar", icsText(h.events()));
      say("Calendar file downloaded. Open it to add the dates and reminders to your calendar.");
    } else if (act === "print") {
      printReport(doc, report());
    } else if (act === "csv" && h.csv) {
      download(doc, fileName(h.name, "csv"), "text/csv", csvText(h.csv()));
      say("Spreadsheet downloaded.");
    } else if (act === "doc") {
      download(doc, fileName(h.name, "doc"), "application/msword", wordDoc(h.name, report()));
      say("Word document downloaded.");
    } else if (act === "def") {
      say(writeJson(dKey, clone(h.state)) ? "This tool will open with these inputs from now on." : "This browser is blocking storage.");
    } else if (act === "undef") {
      try {
        localStorage.removeItem(dKey);
      } catch {
        /* storage blocked */
      }
      say("Starting point cleared.");
    } else if (act === "brand") {
      brandOpen = !brandOpen;
      say(brandOpen ? "" : "Branding saved in this browser.");
    } else if (act === "nologo") {
      writeJson(BRAND_KEY, { ...loadBrand(), logo: "" });
      draw();
    }
  };
  const onChange = (e: Event) => {
    const el = e.target as HTMLInputElement;
    if (!box.contains(el)) return;
    if (el.dataset.lvCmp !== undefined) {
      const i = Number(el.dataset.lvCmp);
      if (el.checked && compare.size >= 3) {
        el.checked = false;
        return say("Compare up to three at a time.");
      }
      if (el.checked) compare.add(i);
      else compare.delete(i);
      const c = box.querySelector("[data-lv-compare]");
      if (c) c.innerHTML = metricsTable();
    } else if (el.dataset.lvFl !== undefined || el.dataset.lvFv !== undefined) {
      const list = [0, 1, 2, 3].map((i) => ({
        label: box.querySelector<HTMLInputElement>(`[data-lv-fl="${i}"]`)?.value ?? "",
        value: box.querySelector<HTMLInputElement>(`[data-lv-fv="${i}"]`)?.value ?? "",
      }));
      writeJson(fKey, list);
    } else if (el.dataset.lvB === "logo" && el.files?.[0]) {
      const file = el.files[0];
      if (file.size > 300_000) return say("That logo is over 300 KB. Try a smaller PNG or JPG.");
      const reader = new FileReader();
      reader.onload = () => {
        say(writeJson(BRAND_KEY, { ...loadBrand(), logo: String(reader.result) }) ? "Logo added." : "This browser is blocking storage.");
      };
      reader.readAsDataURL(file);
    } else if (el.dataset.lvB === "name" || el.dataset.lvB === "colour") {
      writeJson(BRAND_KEY, { ...loadBrand(), [el.dataset.lvB]: el.value });
    }
  };
  // Keep the compare column for "This one" in step with the form.
  let queued = false;
  const onFormInput = (e: Event) => {
    if (box.contains(e.target as Node) || queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      const c = box.querySelector("[data-lv-compare]");
      if (c && compare.size) c.innerHTML = metricsTable();
    });
  };
  box.addEventListener("click", onClick);
  box.addEventListener("change", onChange);
  root.addEventListener("input", onFormInput);
  root.addEventListener("click", onFormInput);
  draw();
  return {
    refresh: draw,
    text: fullText,
    destroy: () => {
      box.removeEventListener("click", onClick);
      box.removeEventListener("change", onChange);
      root.removeEventListener("input", onFormInput);
      root.removeEventListener("click", onFormInput);
      box.remove();
    },
  };
}

// Puts state values back into the form fields that bindState reads from.
export function syncForm(form: HTMLElement, state: Record<string, unknown>) {
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("[data-k]").forEach((el) => {
    const v = state[el.dataset.k!];
    if (v === undefined) return;
    if (el.tagName === "BUTTON") {
      const on = (el as unknown as HTMLButtonElement).dataset.v === String(v);
      el.classList.toggle("is-on", on);
      el.setAttribute("aria-pressed", String(on));
    } else el.value = String(v);
  });
  form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-row][data-f]").forEach((el) => {
    const rows = state[el.dataset.set ?? "rows"] as Record<string, unknown>[] | undefined;
    const v = rows?.[Number(el.dataset.row)]?.[el.dataset.f!];
    if (v !== undefined) el.value = String(v);
  });
  form.querySelectorAll<HTMLInputElement>("input[data-list]").forEach((el) => {
    const list = state[el.dataset.list!];
    if (Array.isArray(list)) el.checked = list.includes(el.value);
  });
}
