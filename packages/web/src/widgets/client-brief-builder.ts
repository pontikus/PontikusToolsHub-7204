import { clientBrief, scopeChecks } from "../web/lib/coastal-experts-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, checkList, copyBlock, field, starterShell } from "./kit";

const area = (key: string, label: string, hint = "") =>
  `<label class="pkst-field"><span class="pkst-label">${esc(label)}</span>${hint ? `<span class="pkst-hint">${esc(hint)}</span>` : ""}<textarea data-k="${key}" rows="3" maxlength="800"></textarea></label>`;

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { client: "", goal: "", scope: "", deliverables: "", exclusions: "", timeline: "", constraints: "", approver: "", checks: [] as string[] };
  const form =
    `<h3 class="pkst-form-title">1. Check the scope</h3>` +
    checkList("checks", "Tick what is already agreed", scopeChecks.map((c) => [c.key, c.q]), state.checks) +
    `<h3 class="pkst-form-title">2. Write the brief</h3>` +
    field("text", "client", "Client", state.client, { attrs: { maxlength: 60 } }) +
    area("goal", "Goal", "What the client wants to change, in one or two sentences.") +
    area("scope", "Scope") +
    area("deliverables", "Deliverables", "One per line.") +
    area("exclusions", "Not included", "One per line.") +
    area("timeline", "Timeline") +
    area("constraints", "Constraints", "Budget, access, tides, permits, people.") +
    field("text", "approver", "Who signs off for the client", state.approver, { attrs: { maxlength: 60 } });
  const { result } = starterShell(root, links, {
    audience: "coastal-experts",
    audienceName: "Coastal Experts",
    type: "Generator",
    intro: "Check the scope for gaps, then turn your notes into a brief the client can sign off, so the work doesn't creep.",
    form,
  });
  const render = () => {
    const answers = Object.fromEntries(scopeChecks.map((c) => [c.key, state.checks.includes(c.key)]));
    const r = clientBrief(state, answers);
    result.innerHTML = `<p class="pkst-eyebrow">SCOPE CHECK</p>
      ${
        r.ready
          ? `<span class="pkst-band high">NO GAPS</span>`
          : `<div class="pkst-fix"><p class="pkst-eyebrow">${r.gaps.length} GAP${r.gaps.length === 1 ? "" : "S"} TO CLOSE BEFORE YOU START</p><ul class="pkst-list">${r.gaps.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>`
      }
      <p class="pkst-eyebrow" style="margin-top:18px">YOUR BRIEF</p>
      ${copyBlock(r.text, "Copy the brief")}`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
