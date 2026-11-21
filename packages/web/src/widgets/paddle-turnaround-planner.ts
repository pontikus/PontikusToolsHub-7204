import { duration, paddleTurnaround, toClock, type ReturnConditions } from "../web/lib/sea-lovers-tools";
import { choiceGroup, defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, row2, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { distance: 5, pace: 5, start: "09:00", backBy: "12:00", back: "against" as ReturnConditions };
  const form =
    row2(
      field("number", "distance", "Distance out (km)", state.distance, { attrs: { min: 0, max: 100, step: 0.5 } }),
      field("number", "pace", "Your pace (km/h)", state.pace, { hint: "In calm water.", attrs: { min: 0.5, max: 20, step: 0.5 } }),
    ) +
    row2(field("time", "start", "Setting off", state.start), field("time", "backBy", "Back on shore by", state.backBy)) +
    choiceGroup("back", "Wind or tide on the way back", [["helping", "Helping"], ["none", "Neither"], ["against", "Against you"]], state.back);
  const { result, levels } = starterShell(root, links, {
    audience: "sea-lovers",
    audienceName: "Sea Lovers",
    type: "Planner",
    intro: "Work out when to turn back, so you are home on time with a fifth of your time kept spare. The way back is planned slower when the wind or tide is against you.",
    form,
  });
  const render = () => {
    const r = paddleTurnaround({ distanceKm: state.distance, paceKmh: state.pace, start: state.start, backBy: state.backBy, back: state.back });
    if (!r) {
      result.innerHTML = `<p class="pkst-eyebrow">YOUR TURNAROUND</p><h3>Check your times.</h3><p>Your back-on-shore time needs to be after your start time.</p>`;
      return;
    }
    result.innerHTML = `<p class="pkst-eyebrow">TURN BACK BY</p>
      <div class="pkst-score"><strong>${toClock(r.turnAt)}</strong></div>
      ${
        r.fits
          ? `<span class="pkst-band high">YOUR ROUTE FITS</span><p style="margin-top:10px">You reach ${esc(state.distance)} km by ${toClock(r.turnAt)}. If you have not, turn back then anyway.</p>`
          : `<span class="pkst-band low">SHORTEN THE ROUTE</span><p style="margin-top:10px">The full ${esc(state.distance)} km does not fit. Turn at about ${r.turnKm} km, or wherever you are at ${toClock(r.turnAt)}.</p>`
      }
      <ul class="pkst-list">
        <li>Way back: about ${duration(r.returnMinutes)}</li>
        <li>Home by: ${toClock(r.homeAt)}</li>
        <li>Time kept spare: ${duration(r.reserve)}</li>
      </ul>
      <div class="pkst-fix"><p class="pkst-eyebrow">KEEP IN MIND</p><p>Wind usually picks up through the day, and an offshore wind makes the way back much harder. Tell someone on shore your turnaround time.</p></div>`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render);
  return () => {
    unbind();
    lv.destroy();
  };
}
