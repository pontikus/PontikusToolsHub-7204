import { rankAreas, scoreWheel, type TipSet, type WheelArea } from "../web/lib/starter-tools";
import { levelLabel, levelOrder, unlockedLevel, type LevelKey } from "../web/lib/levels";
import { toolName } from "./kit";
import { atLeast, levelPanel, readJson, writeJson, type Metric } from "./level-panel";
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

export function readinessWheel(config: WheelConfig) {
  return (root: HTMLElement, links: WidgetLinks = defaultLinks) => {
    injectStyles(root.ownerDocument);
    const plan = memberPlan(root);
    const built: LevelKey[] = config.level1 ? levelOrder : ["starter"];
    const level = unlockedLevel(plan.audience, plan.level, config.audience, built);
    const full = level !== "starter" && config.level1 ? config.level1 : null;
    const l3 = atLeast(level, "level3") && !!full;
    const slug = root.id.replace(/^pkst-/, "") || config.audience;
    const ownKey = `pkst-wheel-own-${slug}`;
    const targetKey = `pkst-wheel-target-${slug}`;
    // Level 3: up to three areas of your own, and a target score.
    const ownAreas = (): WheelArea[] =>
      l3
        ? readJson<string[]>(ownKey, [])
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 3)
            .map((label, i) => ({ key: `own${i}`, label, short: label.split(" ")[0], question: "One of your own areas.", fix: `Pick one step that would lift “${label}” by a point before you score again.` }))
        : [];
    const target = () => (l3 ? Math.max(0, Math.min(100, Number(readJson<number>(targetKey, 0)) || 0)) : 0);
    let areas: WheelArea[] = [];
    const scores: Record<string, number> = {};
    const setAreas = () => {
      areas = [...(full ? full.areas : config.areas), ...ownAreas()];
      areas.forEach((a) => (scores[a.key] ??= 5));
    };
    setAreas();

    const formHtml = () =>
      `<h3 class="pkst-form-title">Score each area from 1 to 10</h3>` + areas.map((a) => scaleInput(a.key, a.label, a.question, scores[a.key])).join("");
    root.innerHTML = shell({
      audienceName: config.audienceName,
      typeLabel: "Assessment",
      intro: full ? full.intro : config.intro,
      form: formHtml(),
      result: "",
      levelLabel: levelLabel(config.audience, level),
    });
    const formEl = root.querySelector<HTMLElement>(".pkst-form")!;
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
      // Results saved before the level panel existed move into it once.
      const vKey = `pkst-v-${slug}`;
      const old = readSaved(full.storageKey);
      if (old.length && !readJson<unknown[]>(vKey, []).length)
        writeJson(
          vKey,
          old.map((o) => ({ name: `${o.score}/100`, at: o.at, state: o.scores })),
        );
    }

    const render = () => {
      const r = scoreWheel(areas, scores);
      const weakIndex = areas.indexOf(r.weakest);
      const tips = full
        ? `<p class="pkst-eyebrow" style="margin-top:20px">YOUR TIPS, WEAKEST FIRST</p><ol class="pkst-tips">${rankAreas(areas, scores, full.tips)
            .map(
              (t) =>
                `<li class="${t.area === r.weakest ? "is-weak" : ""}"><span>${t.score}/10</span><b>${esc(t.area.label)}</b><div>${esc(t.tip || t.area.fix)}</div></li>`,
            )
            .join("")}</ol>`
        : `<p class="pkst-note">At Level 1 the full wheel scores ${config.level1Areas.length} areas: ${esc(config.level1Areas.join(", "))}, with a tip for each.</p>`;
      const goal = target();
      result.innerHTML = `
        <p class="pkst-eyebrow">YOUR READINESS</p>
        <div class="pkst-score"><strong>${r.score}</strong><span>/ 100</span></div>
        <span class="pkst-band ${r.band}">${esc(config.bands[r.band])}</span>
        ${goal ? `<p class="pkst-progress">Your target: ${goal}/100 · ${r.score >= goal ? "reached" : `${goal - r.score} to go`}</p>` : ""}
        ${wheelSvg(areas.map((a) => a.short ?? a.label.split(" ")[0]), areas.map((a) => scores[a.key]), weakIndex)}
        <div class="pkst-fix">
          <p class="pkst-eyebrow">FIX THIS FIRST</p>
          <h4>${esc(r.weakest.label)}</h4>
          <p>${esc(r.weakest.fix)}</p>
        </div>
        ${tips}
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
      if (!key || !(key in scores) || !formEl.contains(input)) return;
      setScore(key, Number(input.value));
      render();
    };
    root.addEventListener("input", onInput);
    render();

    const lv = levelPanel(root, level === "starter" || !full ? "starter" : level, {
      slug,
      name: toolName(slug),
      audience: config.audience,
      type: "Assessment",
      state: scores,
      restore: (saved) => {
        Object.entries(saved).forEach(([k, v]) => (scores[k] = Number(v) || 5));
        areas.forEach((a) => setScore(a.key, scores[a.key]));
        render();
      },
      summary: () => {
        const r = scoreWheel(areas, scores);
        return [
          `Readiness: ${r.score}/100 (${config.bands[r.band]})`,
          `Fix first: ${r.weakest.label}`,
          ...areas.map((a) => `${a.label}: ${scores[a.key]}/10`),
          ...(target() ? [`Target: ${target()}/100`] : []),
        ].join("\n");
      },
      metrics: (st) => {
        const sc = st as Record<string, number>;
        return [["Readiness", scoreWheel(areas, sc).score, `${scoreWheel(areas, sc).score}/100`], ...areas.map((a): Metric => [a.label, sc[a.key] ?? 0, `${sc[a.key] ?? "-"}/10`])];
      },
      custom: {
        html: () => `<label class="pkst-field"><span class="pkst-label">Your own areas, one per line (up to 3)</span>
          <textarea rows="3" maxlength="200" data-lv-areas>${esc(readJson<string[]>(ownKey, []).join("\n"))}</textarea>
          <span class="pkst-hint">They join the wheel and are scored like the others.</span></label>
          <label class="pkst-field"><span class="pkst-label">Your target score (out of 100)</span>
          <input type="number" min="0" max="100" step="5" data-lv-target value="${target() || ""}"></label>`,
        bind: (box) => {
          box.querySelector("[data-lv-areas]")?.addEventListener("change", (e) => {
            writeJson(ownKey, (e.target as HTMLTextAreaElement).value.split("\n").slice(0, 3));
            setAreas();
            formEl.innerHTML = formHtml();
            render();
          });
          box.querySelector("[data-lv-target]")?.addEventListener("change", (e) => {
            writeJson(targetKey, Number((e.target as HTMLInputElement).value) || 0);
            render();
          });
        },
      },
    });
    return () => {
      root.removeEventListener("input", onInput);
      lv.destroy();
    };
  };
}
