import { pitchLonger } from "../web/lib/longer-formats";
import { impactPitch, pitchAudiences, type PitchAudience } from "../web/lib/shoreline-tools";
import { choiceGroup, defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, copyBlock, field, row2, starterShell, textArea } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { project: "", org: "", problem: "", outcomes: "", audience: "sponsor" as PitchAudience, ask: "", timeframe: "", measure: "" };
  const form =
    row2(field("text", "project", "Project", state.project, { attrs: { maxlength: 60, placeholder: "Seagrass restoration at Bay Cove" } }), field("text", "org", "Your business", state.org, { attrs: { maxlength: 60 } })) +
    choiceGroup("audience", "Who you're pitching to", (Object.keys(pitchAudiences) as PitchAudience[]).map((k) => [k, pitchAudiences[k].label]), state.audience) +
    textArea("problem", "The problem it solves", state.problem, { rows: 3 }) +
    textArea("outcomes", "What you'll do and what will change", state.outcomes, { hint: "One per line. Use your own numbers only.", rows: 4 }) +
    textArea("measure", "How you'll know it worked", state.measure, { hint: "What you'll count or record, and how often.", rows: 2 }) +
    row2(field("text", "ask", "What you're asking for", state.ask, { attrs: { maxlength: 100, placeholder: "£3,000 and two volunteer days" } }), field("text", "timeframe", "Timeframe", state.timeframe, { attrs: { maxlength: 60 } }));
  const { result, levels } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Generator",
    intro: "Turn your impact work into a short pitch a council, sponsor, funder or partner can say yes to. Fill in the project and get a pitch pack to edit and send.",
    form,
  });
  const render = () => {
    const r = impactPitch(state);
    result.innerHTML = `<p class="pkst-eyebrow">YOUR PITCH PACK</p>
      <p>For a ${esc(pitchAudiences[state.audience].label.toLowerCase())}, lead with ${esc(r.focus)}.</p>
      ${copyBlock(r.text, "Copy the pitch")}
      ${r.gaps.length ? `<div class="pkst-fix"><p class="pkst-eyebrow">STILL TO ADD</p><p>${esc(r.gaps.join(", ").replace(/^./, (c) => c.toUpperCase()))}.</p></div>` : `<p class="pkst-note">Keep it to one page, and attach one photo of the place or the work.</p>`}`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render, {
    longer: () => pitchLonger(state),
  });
  return () => {
    unbind();
    lv.destroy();
  };
}
