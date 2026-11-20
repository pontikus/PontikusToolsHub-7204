import { profileItems, profileStrength } from "../web/lib/starter-tools";
import { defaultLinks, esc, injectStyles, ladder, shell, verifyCta, type WidgetLinks } from "./core";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  injectStyles(root.ownerDocument);
  const answers: Record<string, boolean> = {};
  const form = () =>
    profileItems
      .map(
        (item) => `<fieldset class="pkst-field"><legend class="pkst-label">${esc(item.label)}</legend>
          <span class="pkst-hint">${esc(item.question)}</span>
          <div class="pkst-yesno">${[true, false]
            .map(
              (v) =>
                `<button type="button" class="pkst-choice${answers[item.key] === v ? " is-on" : ""}" data-k="${esc(item.key)}" data-v="${v}" aria-pressed="${answers[item.key] === v}">${v ? "Yes" : "No"}</button>`,
            )
            .join("")}</div></fieldset>`,
      )
      .join("");
  root.innerHTML = shell({
    audienceName: "Coastal Experts",
    typeLabel: "Assessment",
    intro: "Answer five yes or no questions about your Pontikus profile. You get a strength score and the top three fixes.",
    form: "",
    result: "",
  });
  const formEl = root.querySelector<HTMLElement>(".pkst-form")!;
  const result = root.querySelector<HTMLElement>(".pkst-result")!;
  root.querySelector<HTMLElement>(".pkst-after")!.innerHTML =
    ladder("coastal-experts", "Assessment") + `<div>${verifyCta(links, "Claim your profile")}</div>`;

  const render = () => {
    formEl.innerHTML = form();
    const answered = profileItems.filter((i) => i.key in answers).length;
    const r = profileStrength(answers);
    const fixes = r.fixes
      .map(
        (f) =>
          `<li><strong>${esc(f.label)}.</strong> ${esc(f.fix)}${f.maker ? ` <a href="${esc(links.tool(f.maker.slug))}">Use the ${esc(f.maker.name)}</a>` : ""}</li>`,
      )
      .join("");
    result.innerHTML = `
      <p class="pkst-eyebrow">PROFILE STRENGTH</p>
      <div class="pkst-score"><strong>${r.score}</strong><span>/ 100</span></div>
      <p class="pkst-progress">${answered} of ${profileItems.length} answered${answered < profileItems.length ? " · unanswered count as no" : ""}</p>
      ${
        r.fixes.length
          ? `<div class="pkst-fix"><p class="pkst-eyebrow">TOP ${r.fixes.length === 1 ? "FIX" : `${r.fixes.length} FIXES`}</p><ol class="pkst-fixes">${fixes}</ol></div>`
          : `<div class="pkst-fix"><h4>Your profile covers the essentials.</h4><p>Keep it current: check your services and contact details each season.</p></div>`
      }`;
  };
  const onClick = (e: Event) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-k]");
    if (!btn) return;
    answers[btn.dataset.k!] = btn.dataset.v === "true";
    render();
    root.querySelector<HTMLButtonElement>(`button[data-k="${btn.dataset.k}"][data-v="${btn.dataset.v}"]`)?.focus();
  };
  root.addEventListener("click", onClick);
  render();
  return () => root.removeEventListener("click", onClick);
}
