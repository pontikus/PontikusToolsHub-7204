import { partnerQuestions, partnershipFit, type Answer } from "../web/lib/shoreline-tools";
import { choiceGroup, defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state: Record<string, string> = { partner: "" };
  for (const q of partnerQuestions) state[q.key] = "unsure";
  const opts: [Answer, string][] = [["yes", "Yes"], ["unsure", "Not sure"], ["no", "No"]];
  const form =
    field("text", "partner", "Possible partner", state.partner, { attrs: { maxlength: 60, placeholder: "Bay Refill Shop" } }) +
    partnerQuestions.map((q) => choiceGroup(q.key, q.q, opts, state[q.key])).join("");
  const { result, levels } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Checker",
    intro: "Check whether a possible partner really shares your values before you commit. Answer eight questions and get a fit score and the questions to ask them.",
    form,
  });
  const render = () => {
    const r = partnershipFit(state as Record<string, Answer>);
    const who = state.partner.trim() || "this partner";
    result.innerHTML = `<p class="pkst-eyebrow">FIT SCORE</p>
      <div class="pkst-score"><strong>${r.score}</strong><span>/ 100 · ${esc(r.band)}</span></div>
      ${r.redFlags.length ? `<div class="pkst-fix"><p class="pkst-eyebrow">CHECK THIS FIRST</p><p>You answered no on ${esc(r.redFlags.map((q) => (q.key === "values" ? "shared values" : "visible practices")).join(" and "))}. Get clear answers before anything is announced.</p></div>` : ""}
      ${
        r.ask.length
          ? `<p class="pkst-eyebrow" style="margin-top:16px">QUESTIONS TO ASK ${esc(who.toUpperCase())}</p><ol class="pkst-tips">${r.ask
              .map((q, i) => `<li class="${state[q.key] === "no" ? "is-weak" : ""}"><span>${i + 1}</span><b>${esc(q.ask)}</b><div>${state[q.key] === "no" ? "You answered no." : "You weren't sure."}</div></li>`)
              .join("")}</ol>`
          : `<p style="margin-top:12px">Yes to everything. Agree in writing what each side does, and when you'll review it.</p>`
      }`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render);
  return () => {
    unbind();
    lv.destroy();
  };
}
