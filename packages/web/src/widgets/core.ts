// Shared building blocks for the levelled Starter tools.
// Each tool is a plain-DOM widget: the React app mounts it on its own page, and
// `bun run widgets` bundles each one into a single paste-ready snippet for the
// pontikus.com Boatyard pages (Brilliant Directories), so both run the same code.
import { ladderByType, levelLabel, levelOrder, type ToolType } from "../web/lib/levels";
import { css } from "./styles";

export type WidgetLinks = {
  // Builds the URL of another Boatyard tool from its repo slug.
  tool: (slug: string) => string;
  // Where "Get verified" goes. Placeholder text until the real link is set.
  verify: string;
};

export const defaultLinks: WidgetLinks = {
  tool: (slug) => `/boatyard/${liveSlugs[slug] ?? slug}`,
  verify: "/join-membership",
};

// Repo slugs → live pontikus.com slugs for the makers the Starter tools link to.
const liveSlugs: Record<string, string> = {
  "rate-card": "rate-card-builder",
  "credential-card": "credential-card-maker",
  "availability": "availability-poster-maker",
  "media-kit": "media-kit-builder",
};

export const esc = (value: unknown) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

let styleInjected = false;
export function injectStyles(doc: Document = document) {
  if (styleInjected || doc.getElementById("pkst-styles")) return;
  const style = doc.createElement("style");
  style.id = "pkst-styles";
  style.textContent = css;
  doc.head.appendChild(style);
  styleInjected = true;
}

export function ladder(audience: string, type: ToolType) {
  const rows = levelOrder
    .map((level) => {
      const current = level === "starter";
      return `<li class="${current ? "is-current" : ""}">
        <span class="pkst-level">${esc(levelLabel(audience, level))}</span>
        <span>${esc(ladderByType[type][level])}</span>
        <span class="pkst-tag">${current ? "You are here" : "Coming soon"}</span>
      </li>`;
    })
    .join("");
  return `<section class="pkst-ladder" aria-label="What each level adds">
    <h3>Grow this tool with your membership</h3>
    <ol>${rows}</ol>
  </section>`;
}

export function verifyCta(links: WidgetLinks, text = "Get verified") {
  return `<a class="pkst-button pkst-gold" href="${esc(links.verify)}">${esc(text)}</a>`;
}

// Polar-area wheel: one wedge per area, its length set by the 1–10 score.
export function wheelSvg(labels: string[], values: number[], highlight: number) {
  const size = 280;
  const c = size / 2;
  const rMax = 112;
  const n = labels.length;
  const gap = 0.04;
  const point = (r: number, a: number) =>
    `${(c + r * Math.sin(a)).toFixed(2)} ${(c - r * Math.cos(a)).toFixed(2)}`;
  const wedge = (r: number, a0: number, a1: number) =>
    `M ${c} ${c} L ${point(r, a0)} A ${r} ${r} 0 0 1 ${point(r, a1)} Z`;
  let out = "";
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2 + gap;
    const a1 = ((i + 1) / n) * Math.PI * 2 - gap;
    const r = (Math.max(1, Math.min(10, values[i])) / 10) * rMax;
    out += `<path d="${wedge(rMax, a0, a1)}" class="pkst-wedge-bg"/>`;
    out += `<path d="${wedge(r, a0, a1)}" class="pkst-wedge${i === highlight ? " is-weak" : ""}"/>`;
    const mid = (a0 + a1) / 2;
    const [x, y] = point(rMax + 14, mid).split(" ").map(Number);
    const anchor = Math.abs(Math.sin(mid)) < 0.2 ? "middle" : Math.sin(mid) > 0 ? "start" : "end";
    out += `<text x="${x}" y="${y + 4}" text-anchor="${anchor}">${esc(labels[i].split(" ")[0])}</text>`;
  }
  return `<svg class="pkst-wheel" viewBox="-60 -10 ${size + 120} ${size + 20}" role="img" aria-label="Readiness wheel">${out}</svg>`;
}

export function shell(opts: {
  audienceName: string;
  typeLabel: string;
  intro: string;
  form: string;
  result: string;
}) {
  return `<div class="pkst">
    <p class="pkst-eyebrow">${esc(opts.audienceName.toUpperCase())} · ${esc(opts.typeLabel.toUpperCase())} · STARTER</p>
    <p class="pkst-intro">${esc(opts.intro)}</p>
    <div class="pkst-columns">
      <section class="pkst-form" aria-label="Your answers">${opts.form}</section>
      <section class="pkst-result" aria-live="polite" aria-label="Your result"></section>
    </div>
    <div class="pkst-after"></div>
    <p class="pkst-privacy">Your answers stay in this browser. Nothing is uploaded or saved to a server.</p>
  </div>`;
}

export function scaleInput(key: string, label: string, question: string, value: number) {
  return `<label class="pkst-field">
    <span class="pkst-label">${esc(label)} <output data-out="${esc(key)}">${value}</output>/10</span>
    <span class="pkst-hint">${esc(question)}</span>
    <input type="range" min="1" max="10" step="1" value="${value}" data-k="${esc(key)}" aria-label="${esc(label)} score, 1 to 10">
    <span class="pkst-scale-ends" aria-hidden="true"><span>Not at all</span><span>Fully</span></span>
  </label>`;
}

export function choiceGroup(key: string, label: string, options: [string, string][], value: string) {
  const buttons = options
    .map(
      ([v, text]) =>
        `<button type="button" class="pkst-choice${v === value ? " is-on" : ""}" data-k="${esc(key)}" data-v="${esc(v)}" aria-pressed="${v === value}">${esc(text)}</button>`,
    )
    .join("");
  return `<fieldset class="pkst-field"><legend class="pkst-label">${esc(label)}</legend><div class="pkst-choices">${buttons}</div></fieldset>`;
}

export type Mount = (root: HTMLElement, links?: WidgetLinks) => () => void;
