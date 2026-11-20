// Small Starter tracker: an entry form, up to STARTER_TRACKER_LIMIT entries saved in
// this browser, a list with Delete, and a summary drawn by the tool.
import { STARTER_TRACKER_LIMIT } from "../web/lib/sea-lovers-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { atLeast, bindState, loadList, saveList, shortDate, starterShell, today } from "./kit";
import { readJson, writeJson, type CalEvent } from "./level-panel";

export type TrackerConfig<E extends { date: string }> = {
  audience?: string;
  audienceName?: string;
  addLabel?: string;
  storageKey: string;
  intro: string;
  noun: [one: string, many: string];
  draft: () => Record<string, string | number>;
  form: (draft: Record<string, string | number>) => string;
  toEntry: (draft: Record<string, string | number>) => E | null;
  row: (e: E) => string;
  summary: (entries: E[], links: WidgetLinks) => string;
  // Level 1 reminders. By default, entries dated today or later become calendar events.
  events?: (entries: E[]) => CalEvent[];
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const plain = (html: string) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

// Level 2 dashboard: entries per month for the last six months.
function monthBars(entries: { date: string }[]) {
  const now = new Date();
  const cols = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return { label: MONTHS[d.getMonth()], n: entries.filter((e) => e.date.startsWith(key)).length };
  });
  const max = Math.max(1, ...cols.map((c) => c.n));
  return `<p class="pkst-eyebrow" style="margin-top:18px">LAST SIX MONTHS</p>
    <ul class="pkst-bars" aria-label="Entries per month">${cols
      .map((c) => `<li><span>${c.label}</span><span class="pkst-bar" aria-hidden="true"><i style="width:${Math.round((c.n / max) * 100)}%"></i></span><span>${c.n}</span></li>`)
      .join("")}</ul>`;
}

export function tracker<E extends { date: string }>(cfg: TrackerConfig<E>) {
  return (root: HTMLElement, links: WidgetLinks = defaultLinks) => {
    const state: Record<string, unknown> = { ...cfg.draft() };
    let entries = loadList<E>(cfg.storageKey);
    let note = "";
    const { form, result, level, levels } = starterShell(root, links, {
      audience: cfg.audience ?? "sea-lovers",
      audienceName: cfg.audienceName ?? "Sea Lovers",
      type: "Tracker",
      intro: cfg.intro,
      form: "",
      privacy: "Your log is saved only in this browser. Nothing is uploaded or saved to a server.",
    });
    // Level 1 lifts the Starter limit. Level 3 adds one field of your own to every entry.
    const limit = atLeast(level, "level1") ? Infinity : STARTER_TRACKER_LIMIT;
    const l2 = atLeast(level, "level2");
    const l3 = atLeast(level, "level3");
    const ownKey = `${cfg.storageKey}-own-label`;
    const ownLabel = () => (l3 ? readJson<string>(ownKey, "").trim() : "");
    if (l3) state.own = "";
    const drawForm = () => {
      const own = ownLabel();
      form.innerHTML = cfg.form(state as Record<string, string | number>) + (own ? `<label class="pkst-field"><span class="pkst-label">${esc(own)}</span><input type="text" maxlength="80" data-k="own" value="${esc(state.own ?? "")}"></label>` : "") + `<button type="button" class="pkst-button" data-act="add">${esc(cfg.addLabel ?? "Add to log")}</button>`;
    };
    const render = () => {
      const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
      const full = entries.length >= limit;
      const own = ownLabel();
      result.innerHTML = `${cfg.summary(entries, links)}
        ${l2 && entries.length ? monthBars(entries) : ""}
        <div class="pkst-saved">
          ${note ? `<p class="pkst-note" role="status">${esc(note)}</p>` : ""}
          <p class="pkst-eyebrow" style="margin-top:14px">YOUR LOG · ${entries.length}${limit === Infinity ? "" : ` OF ${limit}`}</p>
          ${
            sorted.length
              ? `<ul>${sorted
                  .map((e) => `<li><span>${esc(shortDate(e.date))} · ${cfg.row(e)}${own && (e as { own?: string }).own ? ` · ${esc(own)}: ${esc((e as { own?: string }).own)}` : ""}</span><button type="button" class="pkst-small" data-act="del" data-i="${entries.indexOf(e)}">Delete</button></li>`)
                  .join("")}</ul>`
              : `<p class="pkst-note">No ${cfg.noun[1]} logged yet.</p>`
          }
          ${full ? `<p class="pkst-note">Starter keeps ${STARTER_TRACKER_LIMIT} ${cfg.noun[1]}. Delete one to add another.</p>` : ""}
        </div>`;
    };
    const unbind = bindState(root, state, () => {
      note = "";
    }, (act, btn) => {
      if (act === "add") {
        if (entries.length >= limit) note = `Starter keeps ${STARTER_TRACKER_LIMIT} ${cfg.noun[1]}. Delete one to add another.`;
        else {
          const e = cfg.toEntry(state as Record<string, string | number>);
          if (!e) note = "Fill in the date and name first.";
          else {
            if (ownLabel() && state.own) (e as { own?: string }).own = String(state.own);
            entries = [...entries, e];
            Object.assign(state, cfg.draft(), l3 ? { own: "" } : {});
            drawForm();
            note = saveList(cfg.storageKey, entries) ? `${cfg.noun[0][0].toUpperCase()}${cfg.noun[0].slice(1)} added.` : "This browser is blocking storage, so the log will be lost when you leave the page.";
          }
        }
      } else if (act === "del") {
        entries = entries.filter((_, i) => i !== Number(btn.dataset.i));
        saveList(cfg.storageKey, entries);
        note = "Deleted.";
      }
      render();
    });
    drawForm();
    render();
    const lv = levels(state, render, {
      noVersions: true,
      summary: () => {
        const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
        const own = ownLabel();
        return `${cfg.noun[1][0].toUpperCase()}${cfg.noun[1].slice(1)} logged: ${entries.length}\n${sorted
          .map((e) => `${shortDate(e.date)} · ${plain(cfg.row(e))}${own && (e as { own?: string }).own ? ` · ${own}: ${(e as { own?: string }).own}` : ""}`)
          .join("\n")}`;
      },
      metrics: undefined,
      csv: () => {
        const keys = [...new Set(entries.flatMap((e) => Object.keys(e)))];
        const own = ownLabel();
        return [keys.map((k) => (k === "own" && own ? own : k)), ...[...entries].sort((a, b) => a.date.localeCompare(b.date)).map((e) => keys.map((k) => String((e as Record<string, unknown>)[k] ?? "")))];
      },
      events: () =>
        cfg.events
          ? cfg.events(entries)
          : entries.filter((e) => e.date >= today()).map((e) => ({ date: e.date, title: `${cfg.noun[0][0].toUpperCase()}${cfg.noun[0].slice(1)}: ${plain(cfg.row(e))}`, remindDays: 1 })),
      custom: {
        html: () => `<label class="pkst-field"><span class="pkst-label">Your own field</span>
          <input type="text" maxlength="30" data-lv-ownlabel value="${esc(readJson<string>(ownKey, ""))}" placeholder="For example: Location">
          <span class="pkst-hint">Name it and it appears on the form, on every new entry and in the spreadsheet.</span></label>`,
        bind: (box) =>
          box.querySelector("[data-lv-ownlabel]")?.addEventListener("change", (e) => {
            writeJson(ownKey, (e.target as HTMLInputElement).value.trim());
            drawForm();
            render();
          }),
      },
    });
    return () => {
      unbind();
      lv.destroy();
    };
  };
}
