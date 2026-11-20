// Small Starter tracker: an entry form, up to STARTER_TRACKER_LIMIT entries saved in
// this browser, a list with Delete, and a summary drawn by the tool.
import { STARTER_TRACKER_LIMIT } from "../web/lib/sea-lovers-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, loadList, saveList, shortDate, starterShell } from "./kit";

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
};

export function tracker<E extends { date: string }>(cfg: TrackerConfig<E>) {
  return (root: HTMLElement, links: WidgetLinks = defaultLinks) => {
    const state: Record<string, unknown> = { ...cfg.draft() };
    let entries = loadList<E>(cfg.storageKey);
    let note = "";
    const { form, result } = starterShell(root, links, {
      audience: cfg.audience ?? "sea-lovers",
      audienceName: cfg.audienceName ?? "Sea Lovers",
      type: "Tracker",
      intro: cfg.intro,
      form: "",
      privacy: "Your log is saved only in this browser. Nothing is uploaded or saved to a server.",
    });
    const drawForm = () => {
      form.innerHTML = cfg.form(state as Record<string, string | number>) + `<button type="button" class="pkst-button" data-act="add">${esc(cfg.addLabel ?? "Add to log")}</button>`;
    };
    const render = () => {
      const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
      const full = entries.length >= STARTER_TRACKER_LIMIT;
      result.innerHTML = `${cfg.summary(entries, links)}
        <div class="pkst-saved">
          ${note ? `<p class="pkst-note" role="status">${esc(note)}</p>` : ""}
          <p class="pkst-eyebrow" style="margin-top:14px">YOUR LOG · ${entries.length} OF ${STARTER_TRACKER_LIMIT}</p>
          ${
            sorted.length
              ? `<ul>${sorted
                  .map((e) => `<li><span>${esc(shortDate(e.date))} · ${cfg.row(e)}</span><button type="button" class="pkst-small" data-act="del" data-i="${entries.indexOf(e)}">Delete</button></li>`)
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
        if (entries.length >= STARTER_TRACKER_LIMIT) note = `Starter keeps ${STARTER_TRACKER_LIMIT} ${cfg.noun[1]}. Delete one to add another.`;
        else {
          const e = cfg.toEntry(state as Record<string, string | number>);
          if (!e) note = "Fill in the date and name first.";
          else {
            entries = [...entries, e];
            Object.assign(state, cfg.draft());
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
    return unbind;
  };
}
