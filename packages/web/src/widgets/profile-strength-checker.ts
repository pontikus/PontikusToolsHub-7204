import { profileItems, profileItemsLevel1, profileStrength, type ProfileItem } from "../web/lib/starter-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { atLeast, starterShell, toolLevel } from "./kit";
import { readJson, writeJson } from "./level-panel";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  // Level 1: ten checks and a fix for every gap. Level 3: your own checks and a target.
  const level = toolLevel(root, "coastal-experts");
  const l1 = atLeast(level, "level1");
  const l3 = atLeast(level, "level3");
  const ownKey = "pkst-profile-own";
  const targetKey = "pkst-profile-target";
  const own = (): ProfileItem[] =>
    l3
      ? readJson<string[]>(ownKey, [])
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 5)
          .map((q, i) => ({ key: `own${i}`, label: q, question: "One of your own checks.", fix: `Sort out: ${q}` }))
      : [];
  const target = () => (l3 ? Number(readJson<number>(targetKey, 0)) || 0 : 0);
  const items = () => [...(l1 ? profileItemsLevel1 : profileItems), ...own()];
  const answers: Record<string, boolean> = {};
  const formHtml = () =>
    items()
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
  const { form: formEl, result, levels } = starterShell(root, links, {
    audience: "coastal-experts",
    audienceName: "Coastal Experts",
    type: "Assessment",
    intro: "Answer five yes or no questions about your Pontikus profile. You get a strength score and the top three fixes.",
    levelIntro: { level1: "Answer ten yes or no questions about your Pontikus profile. You get a strength score and a fix for every gap, most important first." },
    form: "",
  });
  root.querySelector(".pkst-after div:last-child")!.innerHTML = root.querySelector(".pkst-after div:last-child")!.innerHTML.replace(/Get verified/, "Claim your profile");

  const render = () => {
    formEl.innerHTML = formHtml();
    const list = items();
    const answered = list.filter((i) => i.key in answers).length;
    const r = profileStrength(answers, list, l1 ? list.length : 3);
    const goal = target();
    const fixes = r.fixes
      .map(
        (f) =>
          `<li><strong>${esc(f.label)}.</strong> ${esc(f.fix)}${f.maker ? ` <a href="${esc(links.tool(f.maker.slug))}">Use the ${esc(f.maker.name)}</a>` : ""}</li>`,
      )
      .join("");
    result.innerHTML = `
      <p class="pkst-eyebrow">PROFILE STRENGTH</p>
      <div class="pkst-score"><strong>${r.score}</strong><span>/ 100</span></div>
      <p class="pkst-progress">${answered} of ${list.length} answered${answered < list.length ? " · unanswered count as no" : ""}${goal ? ` · target ${goal}: ${r.score >= goal ? "reached" : `${goal - r.score} to go`}` : ""}</p>
      ${
        r.fixes.length
          ? `<div class="pkst-fix"><p class="pkst-eyebrow">${l1 ? "YOUR FIXES" : `TOP ${r.fixes.length === 1 ? "FIX" : `${r.fixes.length} FIXES`}`}</p><ol class="pkst-fixes">${fixes}</ol></div>`
          : `<div class="pkst-fix"><h4>Your profile covers the essentials.</h4><p>Keep it current: check your services and contact details each season.</p></div>`
      }`;
  };
  const onClick = (e: Event) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-k]");
    if (!btn || !formEl.contains(btn)) return;
    answers[btn.dataset.k!] = btn.dataset.v === "true";
    render();
    root.querySelector<HTMLButtonElement>(`button[data-k="${btn.dataset.k}"][data-v="${btn.dataset.v}"]`)?.focus();
  };
  root.addEventListener("click", onClick);
  render();
  const lv = levels(answers, render, {
    restore: (saved) => {
      Object.keys(answers).forEach((k) => delete answers[k]);
      Object.assign(answers, saved);
      render();
    },
    metrics: (st) => {
      const a = st as Record<string, boolean>;
      const list = items();
      return [["Strength", profileStrength(a, list).score, `${profileStrength(a, list).score}/100`], ...list.map((i): [string, number, string] => [i.label, a[i.key] ? 1 : 0, a[i.key] ? "Yes" : "No"])];
    },
    custom: {
      html: () => `<label class="pkst-field"><span class="pkst-label">Your own checks, one per line (up to 5)</span>
        <textarea rows="3" maxlength="400" data-lv-checks>${esc(readJson<string[]>(ownKey, []).join("\n"))}</textarea></label>
        <label class="pkst-field"><span class="pkst-label">Your target score (out of 100)</span>
        <input type="number" min="0" max="100" step="5" data-lv-target value="${target() || ""}"></label>`,
      bind: (box) => {
        box.querySelector("[data-lv-checks]")?.addEventListener("change", (e) => {
          writeJson(ownKey, (e.target as HTMLTextAreaElement).value.split("\n").slice(0, 5));
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
    root.removeEventListener("click", onClick);
    lv.destroy();
  };
}
