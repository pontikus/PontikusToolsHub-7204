import { routePlan } from "../web/lib/coastal-experts-tools";
import { duration, toClock } from "../web/lib/sea-lovers-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, row2, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = {
    start: "08:00",
    finishBy: "17:00",
    returnMin: 60,
    rows: [
      { name: "Client on the island", travelMin: 50, visitMin: 60 },
      { name: "Harbour village", travelMin: 30, visitMin: 45 },
      { name: "Headland farm", travelMin: 25, visitMin: 40 },
      { name: "", travelMin: 20, visitMin: 30 },
      { name: "", travelMin: 20, visitMin: 30 },
    ],
  };
  const form =
    row2(field("time", "start", "Leave base at", state.start), field("time", "finishBy", "Back by", state.finishBy)) +
    `<h3 class="pkst-form-title" style="margin-top:6px">Visits, in the order you'll make them</h3>` +
    state.rows
      .map(
        (r, i) => `<fieldset class="pkst-day"><legend class="pkst-label">Visit ${i + 1}</legend>
        ${field("text", "name", "Client or place", r.name, { row: i, attrs: { maxlength: 50 } })}
        <div class="pkst-row2">
          ${field("number", "travelMin", i === 0 ? "Travel from base (min)" : "Travel from last visit (min)", r.travelMin, { row: i, attrs: { min: 0, max: 600, step: 5 } })}
          ${field("number", "visitMin", "Visit length (min)", r.visitMin, { row: i, attrs: { min: 0, max: 600, step: 5 } })}
        </div></fieldset>`,
      )
      .join("") +
    field("number", "returnMin", "Travel back to base (min)", state.returnMin, { attrs: { min: 0, max: 600, step: 5 } });
  const { result } = starterShell(root, links, {
    audience: "coastal-experts",
    audienceName: "Coastal Experts",
    type: "Planner",
    intro: "Plan a day of coastal and island visits: arrival and leaving times for each client, when you'll be back, and how much of the day goes on travel. Include ferry waits in the travel times.",
    form,
  });
  const render = () => {
    const r = routePlan({ start: state.start, finishBy: state.finishBy, returnMin: state.returnMin, stops: state.rows });
    result.innerHTML = `<p class="pkst-eyebrow">BACK AT BASE</p>
      <div class="pkst-score"><strong>${toClock(r.home)}</strong></div>
      ${r.late ? `<span class="pkst-band low">${esc(duration(r.late))} LATE</span>` : `<span class="pkst-band high">FITS YOUR DAY</span>`}
      <ol class="pkst-timeline" style="margin-top:14px"><li><span>${esc(state.start)}</span>Leave base</li>${r.legs
        .map((l) => `<li><span>${toClock(l.arrive)}</span>${esc(l.name)}, until ${toClock(l.leave)}</li>`)
        .join("")}<li><span>${toClock(r.home)}</span>Back at base</li></ol>
      <p class="pkst-note">${esc(duration(r.travel))} travelling and ${esc(duration(r.visiting))} with clients: ${Math.round(r.travelShare * 100)}% of the day is travel.${
        r.late ? " Move the furthest visit to another day, or shorten a visit." : ""
      } Check ferry and tide times before you set off.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
