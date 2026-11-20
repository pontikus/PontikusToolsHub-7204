import { rankAreas, scoreWheel, type TipSet, type WheelArea } from "../web/lib/starter-tools";
import { levelLabel, unlockedLevel, type LevelKey } from "../web/lib/levels";
import {
  defaultLinks,
  esc,
  injectStyles,
  ladder,
  memberPlan,
  scaleInput,
  shell,
  verifyCta,
  wheelSvg,
  type WidgetLinks,
} from "./core";

type WheelConfig = {
  audience: string;
  audienceName: string;
  intro: string;
  areas: WheelArea[];
  level1Areas: string[];
  bands: Record<"low" | "mid" | "high", string>;
  extraNote?: (links: WidgetLinks) => string;
  // Level 1: the full question set with a tip per area, and results saved in this browser.
  level1?: { intro: string; areas: WheelArea[]; tips: Record<string, TipSet>; storageKey: string };
};

type Saved = { at: string; score: number; weakest: string; scores: Record<string, number> };

// Saved results live only in this browser. Storage can be blocked, so every call is guarded.
function readSaved(key: string): Saved[] {
  try {
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
function writeSaved(key: string, list: Saved[]) {
  try {
    localStorage.setItem(key, JSON.stringify(list.slice(0, 5)));
    return true;
  } catch {
    return false;
  }
}

export function readinessWheel(config: WheelConfig) {
  return (root: HTMLElement, links: WidgetLinks = defaultLinks) => {
    injectStyles(root.ownerDocument);
    const plan = memberPlan(root);
    const built: LevelKey[] = config.level1 ? ["starter", "level1"] : ["starter"];
    const level = unlockedLevel(plan.audience, plan.level, config.audience, built);
    const full = level !== "starter" && config.level1 ? config.level1 : null;
    const areas = full ? full.areas : config.areas;

    const scores: Record<string, number> = Object.fromEntries(areas.map((a) => [a.key, 5]));
    const form =
      `<h3 class="pkst-form-title">Score each area from 1 to 10</h3>` +
      areas.map((a) => scaleInput(a.key, a.label, a.question, scores[a.key])).join("");
    root.innerHTML = shell({
      audienceName: config.audienceName,
      typeLabel: "Assessment",
      intro: full ? full.intro : config.intro,
      form,
      result: "",
      levelLabel: levelLabel(config.audience, level),
    });
    const result = root.querySelector<HTMLElement>(".pkst-result")!;
    const after = root.querySelector<HTMLElement>(".pkst-after")!;
    after.innerHTML =
      ladder(config.audience, "Assessment", {
        current: level,
        built,
        upgrade: plan.member ? links.upgrade : undefined,
      }) + `<div>${verifyCta(links)}</div>`;
    if (full) {
      root.querySelector(".pkst-privacy")!.textContent =
        "Your answers and saved results stay in this browser. Nothing is uploaded or saved to a server.";
    }
    let note = "";

    const savedBlock = () => {
      if (!full) return "";
      const list = readSaved(full.storageKey);
      const rows = list
        .map(
          (s, i) =>
            `<li><span>${esc(new Date(s.at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }))} · ${s.score}/100 · weakest: ${esc(s.weakest)}</span>
            <span><button type="button" class="pkst-small" data-load="${i}">Load</button> <button type="button" class="pkst-small" data-del="${i}">Delete</button></span></li>`,
        )
        .join("");
      return `<div class="pkst-saved">
        <button type="button" class="pkst-button" data-save="1">Save this result</button>
        ${note ? `<p class="pkst-note" role="status">${esc(note)}</p>` : ""}
        ${list.length ? `<p class="pkst-eyebrow" style="margin-top:14px">SAVED RESULTS (LAST 5)</p><ul>${rows}</ul>` : ""}
      </div>`;
    };

    const render = () => {
      const r = scoreWheel(areas, scores);
      const weakIndex = areas.indexOf(r.weakest);
      const tips = full
        ? `<p class="pkst-eyebrow" style="margin-top:20px">YOUR TIPS, WEAKEST FIRST</p><ol class="pkst-tips">${rankAreas(areas, scores, full.tips)
            .map(
              (t) =>
                `<li class="${t.area === r.weakest ? "is-weak" : ""}"><span>${t.score}/10</span><b>${esc(t.area.label)}</b><div>${esc(t.tip)}</div></li>`,
            )
            .join("")}</ol>`
        : `<p class="pkst-note">At Level 1 the full wheel scores ${config.level1Areas.length} areas: ${esc(config.level1Areas.join(", "))}, with a tip for each.</p>`;
      result.innerHTML = `
        <p class="pkst-eyebrow">YOUR READINESS</p>
        <div class="pkst-score"><strong>${r.score}</strong><span>/ 100</span></div>
        <span class="pkst-band ${r.band}">${esc(config.bands[r.band])}</span>
        ${wheelSvg(areas.map((a) => a.short ?? a.label.split(" ")[0]), areas.map((a) => scores[a.key]), weakIndex)}
        <div class="pkst-fix">
          <p class="pkst-eyebrow">FIX THIS FIRST</p>
          <h4>${esc(r.weakest.label)}</h4>
          <p>${esc(r.weakest.fix)}</p>
        </div>
        ${tips}
        ${savedBlock()}
        ${config.extraNote ? `<p class="pkst-note">${config.extraNote(links)}</p>` : ""}`;
    };

    const setScore = (key: string, value: number) => {
      scores[key] = value;
      const out = root.querySelector(`output[data-out="${key}"]`);
      if (out) out.textContent = String(value);
      const input = root.querySelector<HTMLInputElement>(`input[data-k="${key}"]`);
      if (input) input.value = String(value);
    };
    const onInput = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const key = input.dataset.k;
      if (!key || !(key in scores)) return;
      setScore(key, Number(input.value));
      note = "";
      render();
    };
    const onClick = (e: Event) => {
      if (!full) return;
      const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button");
      if (!btn) return;
      const list = readSaved(full.storageKey);
      if (btn.dataset.save) {
        const r = scoreWheel(areas, scores);
        const ok = writeSaved(full.storageKey, [
          { at: new Date().toISOString(), score: r.score, weakest: r.weakest.label, scores: { ...scores } },
          ...list,
        ]);
        note = ok ? "Saved in this browser." : "This browser is blocking storage, so the result could not be saved.";
      } else if (btn.dataset.load) {
        const s = list[Number(btn.dataset.load)];
        if (s) areas.forEach((a) => setScore(a.key, s.scores[a.key] ?? 5));
        note = "Loaded a saved result.";
      } else if (btn.dataset.del) {
        list.splice(Number(btn.dataset.del), 1);
        writeSaved(full.storageKey, list);
        note = "Deleted.";
      } else return;
      render();
      root.querySelector<HTMLButtonElement>("button[data-save]")?.focus();
    };
    root.addEventListener("input", onInput);
    root.addEventListener("click", onClick);
    render();
    return () => {
      root.removeEventListener("input", onInput);
      root.removeEventListener("click", onClick);
    };
  };
}
