// Shared form fields, state binding, storage and the kit-checker factory for the
// batch-2 Starter widgets. Everything here renders into the same .pkst shell.
import { levelLabel, levelOrder, unlockedLevel, type LevelKey, type ToolType } from "../web/lib/levels";
import { buildChecklist, type CheckItem } from "../web/lib/sea-lovers-tools";
import { choiceGroup, defaultLinks, esc, injectStyles, ladder, memberPlan, shell, verifyCta, type WidgetLinks } from "./core";
import { toneOptions, toneText } from "../web/lib/tone";
import { atLeast as atLeastLevel, domMetrics, levelPanel, readJson, syncForm, textOf, writeJson, type CalEvent, type LevelHooks } from "./level-panel";

// Pages on pontikus.com that are not repo tools. Absolute, so they work from the hub too.
export const site = (path: string) => `https://pontikus.com${path}`;

const attrList = (attrs: Record<string, string | number | undefined>) =>
  Object.entries(attrs)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ` ${k}="${esc(v)}"`)
    .join("");

type FieldOpts = { hint?: string; row?: number; attrs?: Record<string, string | number | undefined> };
const dataAttrs = (key: string, row?: number) => (row === undefined ? ` data-k="${esc(key)}"` : ` data-row="${row}" data-f="${esc(key)}"`);

export function field(type: "number" | "text" | "time" | "date" | "tel", key: string, label: string, value: string | number, o: FieldOpts = {}) {
  const mode = type === "number" ? ' inputmode="decimal"' : "";
  return `<label class="pkst-field"><span class="pkst-label">${esc(label)}</span>${o.hint ? `<span class="pkst-hint">${esc(o.hint)}</span>` : ""}<input type="${type}"${mode}${dataAttrs(key, o.row)} value="${esc(value)}"${attrList(o.attrs ?? {})}></label>`;
}

export function selectField(key: string, label: string, options: [string, string][], value: string, o: FieldOpts = {}) {
  const opts = options.map(([v, t]) => `<option value="${esc(v)}"${v === value ? " selected" : ""}>${esc(t)}</option>`).join("");
  return `<label class="pkst-field"><span class="pkst-label">${esc(label)}</span>${o.hint ? `<span class="pkst-hint">${esc(o.hint)}</span>` : ""}<select${dataAttrs(key, o.row)}>${opts}</select></label>`;
}

export function checkList(key: string, label: string, options: [string, string][], values: string[]) {
  const rows = options
    .map(([v, t]) => `<li><label><input type="checkbox" data-list="${esc(key)}" value="${esc(v)}"${values.includes(v) ? " checked" : ""}><span>${esc(t)}</span></label></li>`)
    .join("");
  return `<fieldset class="pkst-field"><legend class="pkst-label">${esc(label)}</legend><ul class="pkst-check pkst-have">${rows}</ul></fieldset>`;
}

export function textArea(key: string, label: string, value: string, o: { hint?: string; rows?: number; max?: number; placeholder?: string } = {}) {
  return `<label class="pkst-field"><span class="pkst-label">${esc(label)}</span>${o.hint ? `<span class="pkst-hint">${esc(o.hint)}</span>` : ""}<textarea data-k="${esc(key)}" rows="${o.rows ?? 3}" maxlength="${o.max ?? 800}"${o.placeholder ? ` placeholder="${esc(o.placeholder)}"` : ""}>${esc(value)}</textarea></label>`;
}

export const row2 =(a: string, b: string) => `<div class="pkst-row2">${a}${b}</div>`;

// The level this member has unlocked for a tool of this audience. Tools call it before
// building the form when Level 1 adds inputs.
export const toolLevel = (root: HTMLElement, audience: string): LevelKey => {
  const plan = memberPlan(root);
  return unlockedLevel(plan.audience, plan.level, audience, levelOrder);
};
export { atLeast } from "./level-panel";

// Draws the shell, the level ladder and the verify button. Returns the two areas a tool
// fills and the level the member has unlocked for this tool (from the page's plan data).
export function starterShell(
  root: HTMLElement,
  links: WidgetLinks,
  o: { audience: string; audienceName: string; type: ToolType; intro: string; form: string; privacy?: string; levelIntro?: Partial<Record<LevelKey, string>>; slug?: string; name?: string },
) {
  injectStyles(root.ownerDocument);
  const plan = memberPlan(root);
  const level = toolLevel(root, o.audience);
  const intro = [...levelOrder].reverse().find((l) => levelOrder.indexOf(l) <= levelOrder.indexOf(level) && o.levelIntro?.[l]);
  root.innerHTML = shell({ audienceName: o.audienceName, typeLabel: o.type, intro: (intro && o.levelIntro?.[intro]) || o.intro, form: o.form, result: "", levelLabel: levelLabel(o.audience, level) });
  root.querySelector<HTMLElement>(".pkst-after")!.innerHTML =
    ladder(o.audience, o.type, { current: level, built: levelOrder, upgrade: plan.member ? links.upgrade : undefined }) + `<div>${verifyCta(links)}</div>`;
  if (o.privacy) root.querySelector(".pkst-privacy")!.textContent = o.privacy;
  const form = root.querySelector<HTMLElement>(".pkst-form")!;
  const result = root.querySelector<HTMLElement>(".pkst-result")!;
  const slug = o.slug ?? root.id.replace(/^pkst-/, "");
  const name = o.name ?? toolName(slug);
  // Adds the Level 1-3 panel. By default the summary is the result as text and, for
  // tools that work out numbers, compare reads the score and bars from the result.
  // Planners gain a date (for calendar reminders) and notes; Generators gain a tone.
  const levels = (state: Record<string, unknown>, render: () => void, extra: Partial<Omit<LevelHooks, "state">> = {}) => {
    const l1 = atLeastLevel(level, "level1");
    let more = "";
    let stopTone = () => {};
    if (l1 && o.type === "Planner") {
      if (!("date" in state)) {
        state.date = today();
        more += field("date", "date", "Date", String(state.date), { hint: "Used for the calendar file and reminders." });
      }
      state.notes ??= "";
      more += textArea("notes", "Your notes", String(state.notes), { rows: 3, max: 500, hint: "Anything you want to add to the plan. Saved with it." });
    }
    const signKey = `pkst-sign-${slug}`;
    const signOff = () => (atLeastLevel(level, "level3") ? readJson<string>(signKey, "").trim() : "");
    if (l1 && o.type === "Generator") {
      state.tone ??= "friendly";
      more += selectField("tone", "Tone", toneOptions, String(state.tone), { hint: "Rewrites the message as written, more formal, or short and direct." });
      stopTone = applyTone(result, () => String(state.tone), signOff);
    }
    if (more) form.insertAdjacentHTML("beforeend", `<h3 class="pkst-form-title" style="margin-top:6px">Your ${o.type === "Planner" ? "plan" : "message"}</h3>${more}`);
    const notes = () => (state.notes ? `\n\nNotes: ${String(state.notes)}` : "");
    const dated = () => (o.type === "Planner" && state.date ? `${shortDate(String(state.date))}\n` : "");
    const lv = addLevels(root, level, form, render, {
      slug,
      name,
      audience: o.audience,
      type: o.type,
      state,
      summary: () => dated() + textOf(result) + notes(),
      metrics: o.type === "Calculator" || o.type === "Assessment" ? () => domMetrics(result) : undefined,
      events: o.type === "Planner" ? () => timelineEvents(result, String(state.date ?? ""), name) : undefined,
      custom:
        o.type === "Generator"
          ? {
              html: () => `<label class="pkst-field"><span class="pkst-label">Your sign-off</span>
                <textarea rows="3" maxlength="300" data-lv-sign placeholder="Your name, role, phone and website">${esc(readJson<string>(signKey, ""))}</textarea>
                <span class="pkst-hint">Added to the end of every message this tool writes.</span></label>`,
              bind: (box) =>
                box.querySelector("[data-lv-sign]")?.addEventListener("change", (e) => {
                  writeJson(signKey, (e.target as HTMLTextAreaElement).value);
                  render();
                }),
            }
          : undefined,
      ...extra,
    });
    return { ...lv, destroy: () => (stopTone(), lv.destroy()) };
  };
  return { form, result, level, levels };
}

const SMALL = new Set(["and", "of", "to", "for", "the", "a"]);
export const toolName = (slug: string) =>
  slug
    .split("-")
    .map((w, i) => (i && SMALL.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

// Adds the Level 1-3 panel to a form-and-result tool. Restoring a saved version copies it
// into `state`, puts the values back in the form and re-renders.
export function addLevels(
  root: HTMLElement,
  level: LevelKey,
  form: HTMLElement,
  render: () => void,
  h: Omit<LevelHooks, "restore"> & { restore?: LevelHooks["restore"] },
) {
  const restore =
    h.restore ??
    ((saved: Record<string, unknown>) => {
      Object.assign(h.state, JSON.parse(JSON.stringify(saved)));
      syncForm(form, h.state);
      render();
    });
  return levelPanel(root, level, { ...h, restore });
}

// Keeps `state` in step with the form: data-k fields and choice buttons set state[key],
// data-row/data-f fields set state.rows[i][f] (or state[data-set][i][f]), data-list checkboxes toggle an array.
// Buttons with data-act are passed to `onAction`. Copy buttons copy the nearest <pre>.
export function bindState<S extends Record<string, unknown>>(
  root: HTMLElement,
  state: S,
  render: () => void,
  onAction?: (act: string, btn: HTMLButtonElement) => void,
) {
  const s = state as Record<string, unknown>;
  const read = (el: HTMLInputElement | HTMLSelectElement) => (el.type === "number" ? Number(el.value) || 0 : el.value);
  const onInput = (e: Event) => {
    const el = e.target as HTMLInputElement | HTMLSelectElement;
    if (el.dataset.list) {
      const list = new Set(s[el.dataset.list] as string[]);
      if ((el as HTMLInputElement).checked) list.add(el.value);
      else list.delete(el.value);
      s[el.dataset.list] = [...list];
    } else if (el.dataset.row !== undefined && el.dataset.f) {
      (s[el.dataset.set ?? "rows"] as Record<string, unknown>[])[Number(el.dataset.row)][el.dataset.f] = read(el);
    } else if (el.dataset.k && el.tagName !== "BUTTON") {
      s[el.dataset.k] = read(el);
    } else return;
    render();
  };
  const onClick = (e: Event) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
    if (!btn || !root.contains(btn)) return;
    if (btn.dataset.copy !== undefined) {
      const pre = btn.parentElement?.querySelector("pre");
      if (pre) copyText(pre.textContent ?? "", btn);
      return;
    }
    if (btn.dataset.act) {
      onAction?.(btn.dataset.act, btn);
      return;
    }
    const key = btn.dataset.k;
    if (!key || btn.dataset.v === undefined) return;
    s[key] = btn.dataset.v;
    root.querySelectorAll<HTMLButtonElement>(`button[data-k="${CSS.escape(key)}"]`).forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    render();
  };
  root.addEventListener("input", onInput);
  root.addEventListener("change", onInput);
  root.addEventListener("click", onClick);
  return () => {
    root.removeEventListener("input", onInput);
    root.removeEventListener("change", onInput);
    root.removeEventListener("click", onClick);
  };
}

export function copyBlock(text: string, label = "Copy") {
  return `<div class="pkst-copy"><pre>${esc(text)}</pre><button type="button" class="pkst-small" data-copy>${esc(label)}</button></div>`;
}

function copyText(text: string, btn: HTMLButtonElement) {
  const done = (ok: boolean) => {
    const before = btn.textContent;
    btn.textContent = ok ? "Copied" : "Select the text and copy it";
    setTimeout(() => (btn.textContent = before), 2000);
  };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
  else done(false);
}

// Saved lists live only in this browser. Storage can be blocked, so every call is guarded.
export function loadList<T>(key: string): T[] {
  try {
    const list = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
export function saveList<T>(key: string, list: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export const today = () => new Date().toISOString().slice(0, 10);
export const shortDate = (iso: string) => {
  const d = new Date(iso + "T12:00:00");
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

// ---------- Kit checkers ----------
// Rules can carry a level: items with `lvl: "level1"` join the list from Level 1 up.
type KitItem = CheckItem & { lvl?: LevelKey };
type KitRule<S> = { when?: (s: S) => boolean; items: KitItem[] };
export type KitConfig<S extends Record<string, string>> = {
  audience: string;
  audienceName: string;
  intro: string;
  type?: ToolType;
  questions: [key: keyof S & string, label: string, options: [string, string][]][];
  defaults: S;
  groups: string[];
  rules?: KitRule<S>[];
  // Or build the list directly (the Sea Swim Kit Checker keeps its own list logic).
  build?: (s: S) => KitItem[];
  note: (links: WidgetLinks) => string;
};

// Short ids keep rule lists readable: item("dry-bag", "Kit", "Dry bag for phone and keys").
// A fourth argument sets the level the item joins at.
export const item = (id: string, group: string, text: string, lvl?: LevelKey): KitItem => ({ id, group, text, lvl });

const OWN = "Your own items";

export function kitChecker<S extends Record<string, string>>(cfg: KitConfig<S>) {
  return (root: HTMLElement, links: WidgetLinks = defaultLinks) => {
    const state: Record<string, unknown> = { ...cfg.defaults, ticked: [] as string[] };
    const form = cfg.questions.map(([key, label, options]) => choiceGroup(key, label, options, String(state[key]))).join("");
    const { result, level, levels } = starterShell(root, links, {
      audience: cfg.audience,
      audienceName: cfg.audienceName,
      type: cfg.type ?? "Checker",
      intro: cfg.intro,
      form,
    });
    const slug = root.id.replace(/^pkst-/, "");
    const l1 = atLeastLevel(level, "level1");
    const l2 = atLeastLevel(level, "level2");
    const l3 = atLeastLevel(level, "level3");
    const tickKey = `pkst-ticks-${slug}`;
    const ownKey = `pkst-own-${slug}`;
    // Level 1 keeps your ticks between visits.
    if (l1) state.ticked = readJson<string[]>(tickKey, []);
    const ticked = () => new Set(state.ticked as string[]);
    const own = (): KitItem[] =>
      l3
        ? readJson<string[]>(ownKey, [])
            .map((t) => t.trim())
            .filter(Boolean)
            .map((text, i) => ({ id: `own-${i}-${text.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24)}`, group: OWN, text }))
        : [];
    const groups = () => (own().length ? [...cfg.groups, OWN] : cfg.groups);
    const items = () => {
      const s = state as S;
      const base = cfg.build ? cfg.build(s) : buildChecklist(cfg.rules ?? [], s, cfg.groups);
      return [...(base as KitItem[]).filter((i) => !i.lvl || atLeastLevel(level, i.lvl)), ...own()];
    };
    const progress = (list: KitItem[]) => {
      const t = ticked();
      const done = list.filter((i) => t.has(i.id)).length;
      return `${done} of ${list.length} ticked${done === list.length ? " · all set" : ""}`;
    };
    const render = () => {
      const list = items();
      const t = ticked();
      const html = groups()
        .map((g) => {
          const rows = list
            .filter((i) => i.group === g)
            .map((i) => `<li><label><input type="checkbox" data-tick="${esc(i.id)}"${t.has(i.id) ? " checked" : ""}><span>${esc(i.text)}</span></label></li>`)
            .join("");
          return rows ? `<li><h4>${esc(g)}</h4><ul class="pkst-check">${rows}</ul></li>` : "";
        })
        .join("");
      const done = list.filter((i) => t.has(i.id)).length;
      const pct = list.length ? Math.round((done / list.length) * 100) : 0;
      result.innerHTML = `<p class="pkst-eyebrow">YOUR CHECKLIST</p>
        ${l2 ? `<p class="pkst-eyebrow" style="margin-top:8px">READY</p><div class="pkst-score"><strong>${pct}%</strong><span>${done} of ${list.length}</span></div>` : ""}
        <p class="pkst-progress">${progress(list)}</p>
        <ul class="pkst-check">${html}</ul>
        <p class="pkst-note">${cfg.note(links)}</p>`;
    };
    const unbind = bindState(root, state, render);
    const onTick = (e: Event) => {
      const box = e.target as HTMLInputElement;
      if (!box.dataset.tick) return;
      const t = ticked();
      if (box.checked) t.add(box.dataset.tick);
      else t.delete(box.dataset.tick);
      state.ticked = [...t];
      if (l1) writeJson(tickKey, state.ticked);
      if (l2) render();
      else {
        const p = result.querySelector(".pkst-progress");
        if (p) p.textContent = progress(items());
      }
    };
    root.addEventListener("change", onTick);
    render();
    const lv = levels(state, render, {
      restore: (saved) => {
        Object.assign(state, JSON.parse(JSON.stringify(saved)));
        if (l1) writeJson(tickKey, state.ticked);
        syncForm(root.querySelector<HTMLElement>(".pkst-form")!, state);
        render();
      },
      metrics: () => {
        const list = items();
        const t = ticked();
        const done = list.filter((i) => t.has(i.id)).length;
        return [
          ["Ready", list.length ? Math.round((done / list.length) * 100) : 0, `${list.length ? Math.round((done / list.length) * 100) : 0}%`],
          ["Ticked", done],
          ["Items", list.length],
        ];
      },
      custom: {
        html: () => `<label class="pkst-field"><span class="pkst-label">Your own items, one per line</span>
          <textarea rows="4" maxlength="1200" data-lv-own>${esc(readJson<string[]>(ownKey, []).join("\n"))}</textarea>
          <span class="pkst-hint">They appear on this checklist every time, under “${OWN}”.</span></label>`,
        bind: (box) =>
          box.querySelector("[data-lv-own]")?.addEventListener("change", (e) => {
            writeJson(ownKey, (e.target as HTMLTextAreaElement).value.split("\n").slice(0, 30));
            render();
          }),
      },
    });
    return () => {
      unbind();
      root.removeEventListener("change", onTick);
      lv.destroy();
    };
  };
}

// Calendar events from a rendered plan timeline: "09:30" steps become timed events on the
// plan's date, other steps ("Day before") become all-day events with a reminder.
export function timelineEvents(result: HTMLElement, date: string, name: string): CalEvent[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const steps = [...result.querySelectorAll(".pkst-timeline li")].map((li) => {
    const when = (li.querySelector("span")?.textContent ?? "").trim();
    return { when, what: (li.textContent ?? "").replace(when, "").trim() };
  });
  if (!steps.length) return [{ date, title: name, remindDays: 1 }];
  return steps.map((s) =>
    /^\d{1,2}:\d{2}$/.test(s.when)
      ? { date, time: s.when.padStart(5, "0"), minutes: 30, title: s.what, description: name }
      : { date, title: `${s.when}: ${s.what}`, description: name, remindDays: 1 },
  );
}

// Generators at Level 1: rewrite every message block in the chosen tone after each render.
// At Level 3 the member's own sign-off is added to the end.
function applyTone(result: HTMLElement, tone: () => string, sign: () => string) {
  const run = () => {
    result.querySelectorAll("pre").forEach((pre) => {
      if (pre.dataset.raw === undefined) pre.dataset.raw = pre.textContent ?? "";
      const out = toneText(pre.dataset.raw, tone()) + (sign() ? `\n\n${sign()}` : "");
      if (pre.textContent !== out) pre.textContent = out;
    });
  };
  const obs = new MutationObserver(run);
  obs.observe(result, { childList: true, subtree: true });
  run();
  return () => obs.disconnect();
}
