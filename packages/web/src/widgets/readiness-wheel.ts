import { scoreWheel, type WheelArea } from "../web/lib/starter-tools";
import { defaultLinks, esc, injectStyles, ladder, scaleInput, shell, verifyCta, wheelSvg, type WidgetLinks } from "./core";

type WheelConfig = {
  audience: string;
  audienceName: string;
  intro: string;
  areas: WheelArea[];
  level1Areas: string[];
  bands: Record<"low" | "mid" | "high", string>;
  extraNote?: (links: WidgetLinks) => string;
};

export function readinessWheel(config: WheelConfig) {
  return (root: HTMLElement, links: WidgetLinks = defaultLinks) => {
    injectStyles(root.ownerDocument);
    const scores: Record<string, number> = Object.fromEntries(config.areas.map((a) => [a.key, 5]));
    const form =
      `<h3 class="pkst-form-title">Score each area from 1 to 10</h3>` +
      config.areas.map((a) => scaleInput(a.key, a.label, a.question, scores[a.key])).join("");
    root.innerHTML = shell({
      audienceName: config.audienceName,
      typeLabel: "Assessment",
      intro: config.intro,
      form,
      result: "",
    });
    const result = root.querySelector<HTMLElement>(".pkst-result")!;
    const after = root.querySelector<HTMLElement>(".pkst-after")!;
    after.innerHTML =
      ladder(config.audience, "Assessment") +
      `<div>${verifyCta(links)}</div>`;

    const render = () => {
      const r = scoreWheel(config.areas, scores);
      const weakIndex = config.areas.indexOf(r.weakest);
      result.innerHTML = `
        <p class="pkst-eyebrow">YOUR READINESS</p>
        <div class="pkst-score"><strong>${r.score}</strong><span>/ 100</span></div>
        <span class="pkst-band ${r.band}">${esc(config.bands[r.band])}</span>
        ${wheelSvg(config.areas.map((a) => a.label), config.areas.map((a) => scores[a.key]), weakIndex)}
        <div class="pkst-fix">
          <p class="pkst-eyebrow">FIX THIS FIRST</p>
          <h4>${esc(r.weakest.label)}</h4>
          <p>${esc(r.weakest.fix)}</p>
        </div>
        <p class="pkst-note">At Level 1 the full wheel scores ${config.level1Areas.length} areas: ${esc(config.level1Areas.join(", "))}, with a tip for each.</p>
        ${config.extraNote ? `<p class="pkst-note">${config.extraNote(links)}</p>` : ""}`;
    };
    const onInput = (e: Event) => {
      const input = e.target as HTMLInputElement;
      const key = input.dataset.k;
      if (!key || !(key in scores)) return;
      scores[key] = Number(input.value);
      const out = root.querySelector(`output[data-out="${key}"]`);
      if (out) out.textContent = input.value;
      render();
    };
    root.addEventListener("input", onInput);
    render();
    return () => root.removeEventListener("input", onInput);
  };
}
