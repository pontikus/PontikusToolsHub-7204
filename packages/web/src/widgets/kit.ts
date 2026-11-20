// Shared form fields, state binding, storage and the kit-checker factory for the
// batch-2 Starter widgets. Everything here renders into the same .pkst shell.
import type { ToolType } from "../web/lib/levels";
import { buildChecklist, type CheckItem } from "../web/lib/sea-lovers-tools";
import { choiceGroup, defaultLinks, esc, injectStyles, ladder, shell, verifyCta, type WidgetLinks } from "./core";

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

// Draws the shell, the level ladder and the verify button. Returns the two areas a tool fills.
export function starterShell(
  root: HTMLElement,
  links: WidgetLinks,
  o: { audience: string; audienceName: string; type: ToolType; intro: string; form: string; privacy?: string },
) {
  injectStyles(root.ownerDocument);
  root.innerHTML = shell({ audienceName: o.audienceName, typeLabel: o.type, intro: o.intro, form: o.form, result: "" });
  root.querySelector<HTMLElement>(".pkst-after")!.innerHTML = ladder(o.audience, o.type) + `<div>${verifyCta(links)}</div>`;
  if (o.privacy) root.querySelector(".pkst-privacy")!.textContent = o.privacy;
  return { form: root.querySelector<HTMLElement>(".pkst-form")!, result: root.querySelector<HTMLElement>(".pkst-result")! };
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
type KitRule<S> = { when?: (s: S) => boolean; items: CheckItem[] };
export type KitConfig<S extends Record<string, string>> = {
  audience: string;
  audienceName: string;
  intro: string;
  type?: ToolType;
  questions: [key: keyof S & string, label: string, options: [string, string][]][];
  defaults: S;
  groups: string[];
  rules: KitRule<S>[];
  note: (links: WidgetLinks) => string;
};

// Short ids keep rule lists readable: item("dry-bag", "Kit", "Dry bag for phone and keys").
export const item = (id: string, group: string, text: string): CheckItem => ({ id, group, text });

export function kitChecker<S extends Record<string, string>>(cfg: KitConfig<S>) {
  return (root: HTMLElement, links: WidgetLinks = defaultLinks) => {
    const state = { ...cfg.defaults };
    const ticked = new Set<string>();
    const form = cfg.questions.map(([key, label, options]) => choiceGroup(key, label, options, state[key])).join("");
    const { result } = starterShell(root, links, {
      audience: cfg.audience,
      audienceName: cfg.audienceName,
      type: cfg.type ?? "Checker",
      intro: cfg.intro,
      form,
    });
    const progress = (items: CheckItem[]) => {
      const done = items.filter((i) => ticked.has(i.id)).length;
      return `${done} of ${items.length} ticked${done === items.length ? " · all set" : ""}`;
    };
    const render = () => {
      const items = buildChecklist(cfg.rules, state, cfg.groups);
      const groups = cfg.groups
        .map((g) => {
          const rows = items
            .filter((i) => i.group === g)
            .map((i) => `<li><label><input type="checkbox" data-tick="${esc(i.id)}"${ticked.has(i.id) ? " checked" : ""}><span>${esc(i.text)}</span></label></li>`)
            .join("");
          return rows ? `<li><h4>${esc(g)}</h4><ul class="pkst-check">${rows}</ul></li>` : "";
        })
        .join("");
      result.innerHTML = `<p class="pkst-eyebrow">YOUR CHECKLIST</p>
        <p class="pkst-progress">${progress(items)}</p>
        <ul class="pkst-check">${groups}</ul>
        <p class="pkst-note">${cfg.note(links)}</p>`;
    };
    const unbind = bindState(root, state, render);
    const onTick = (e: Event) => {
      const box = e.target as HTMLInputElement;
      if (!box.dataset.tick) return;
      if (box.checked) ticked.add(box.dataset.tick);
      else ticked.delete(box.dataset.tick);
      const p = result.querySelector(".pkst-progress");
      if (p) p.textContent = progress(buildChecklist(cfg.rules, state, cfg.groups));
    };
    root.addEventListener("change", onTick);
    render();
    return () => {
      unbind();
      root.removeEventListener("change", onTick);
    };
  };
}
