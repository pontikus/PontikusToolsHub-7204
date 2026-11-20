import { shotPlan, toClock } from "../web/lib/sea-lovers-tools";
import { choiceGroup, defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, row2, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { session: "evening" as "morning" | "evening", sunTime: "19:30", travel: 25, setup: 20, lowTide: "" };
  const form =
    choiceGroup("session", "When are you shooting?", [["morning", "Sunrise"], ["evening", "Sunset"]], state.session) +
    field("time", "sunTime", "Sunrise or sunset time", state.sunTime, { hint: "From your weather app for the day and place." }) +
    row2(
      field("number", "travel", "Travel time (min)", state.travel, { attrs: { min: 0, max: 600, step: 5 } }),
      field("number", "setup", "Walk and set-up (min)", state.setup, { attrs: { min: 0, max: 240, step: 5 } }),
    ) +
    field("time", "lowTide", "Low tide (optional)", state.lowTide, { hint: "Leave blank if the tide doesn't matter for this spot." });
  const { result } = starterShell(root, links, {
    audience: "sea-lovers",
    audienceName: "Sea Lovers",
    type: "Planner",
    intro: "Plan a coastal shoot around the best light: when to leave, when to be set up, and what the tide will be doing.",
    form,
  });
  const render = () => {
    const p = shotPlan({ session: state.session, sunTime: state.sunTime, travelMin: state.travel, setupMin: state.setup, lowTide: state.lowTide || undefined });
    if (!p) {
      result.innerHTML = `<p class="pkst-eyebrow">YOUR SHOOT PLAN</p><h3>Add the sunrise or sunset time.</h3>`;
      return;
    }
    const steps = [
      [p.leave, "Leave"],
      [p.arrive, "Arrive and set up"],
      ...p.windows.map((w) => [w.from, `${w.name} starts`] as [number, string]),
      [p.windows[p.windows.length - 1].to, "Light fades: pack up"],
    ] as [number, string][];
    result.innerHTML = `<p class="pkst-eyebrow">LEAVE BY</p>
      <div class="pkst-score"><strong>${toClock(p.leave)}</strong></div>
      <ol class="pkst-timeline">${steps.map(([t, what]) => `<li><span>${toClock(t)}</span>${esc(what)}</li>`).join("")}</ol>
      ${p.tideNote ? `<div class="pkst-fix"><p class="pkst-eyebrow">THE TIDE</p><p>${esc(p.tideNote)}</p></div>` : ""}
      <p class="pkst-note">Backup if the sky is flat: ${esc(p.backup.toLowerCase())}. Golden and blue hour times are approximate and shift with the season and how far north or south you are.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
