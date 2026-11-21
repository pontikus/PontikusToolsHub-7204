import { beachCleanPlan, toClock, type CleanKit } from "../web/lib/sea-lovers-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, checkList, field, row2, starterShell } from "./kit";

const kitNames: [CleanKit, string][] = [
  ["gloves", "Gloves"],
  ["bags", "Rubbish bags"],
  ["pickers", "Litter pickers"],
  ["firstaid", "First aid kit"],
  ["hivis", "Hi-vis vests"],
  ["sharps", "Sharps box"],
];

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { start: "10:00", hours: 2, volunteers: 12, have: ["gloves", "bags"] as string[] };
  const form =
    row2(field("time", "start", "Start time", state.start), field("number", "hours", "How long (hours)", state.hours, { attrs: { min: 0.5, max: 8, step: 0.5 } })) +
    field("number", "volunteers", "Volunteers you expect", state.volunteers, { attrs: { min: 1, max: 500, step: 1 } }) +
    checkList("have", "What you already have", kitNames, state.have);
  const { result, levels } = starterShell(root, links, {
    audience: "sea-lovers",
    audienceName: "Sea Lovers",
    type: "Planner",
    intro: "Plan a beach clean: who does what, the kit to bring for your group, and a timeline for the day.",
    form,
  });
  const render = () => {
    const p = beachCleanPlan({ start: state.start, hours: state.hours, volunteers: state.volunteers, have: state.have as CleanKit[] });
    result.innerHTML = `<p class="pkst-eyebrow">YOUR BEACH CLEAN</p>
      ${
        p.missing.length
          ? `<div class="pkst-fix"><p class="pkst-eyebrow">STILL TO FIND</p><ul class="pkst-list">${p.missing.map((k) => `<li>${k.qty} × ${esc(k.text.toLowerCase())}</li>`).join("")}</ul></div>`
          : `<span class="pkst-band high">KIT SORTED</span>`
      }
      <p class="pkst-eyebrow" style="margin-top:18px">ROLES</p>
      <ul class="pkst-list">${p.roles.map((r) => `<li><b>${esc(r.role)}${r.count > 1 ? ` × ${r.count}` : ""}</b>: ${esc(r.job)}</li>`).join("")}</ul>
      <p class="pkst-eyebrow" style="margin-top:18px">ON THE DAY</p>
      <ol class="pkst-timeline">${p.timeline.map((t) => `<li><span>${toClock(t.at)}</span>${esc(t.what)}</li>`).join("")}</ol>
      <p class="pkst-note">Ask the landowner or council before you go, and agree where the bags will be collected. Afterwards, record what you collected in the <a class="pkst-link" href="${esc(links.tool("impact-log"))}">Impact Log</a>.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render);
  return () => {
    unbind();
    lv.destroy();
  };
}
