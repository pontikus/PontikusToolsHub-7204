import { addDays, sessionFill } from "../web/lib/coastal-experts-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, shortDate, starterShell, today } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const t = today();
  const state = {
    target: 80,
    rows: [
      { name: "Sea safety course", date: addDays(t, 10), capacity: 12, booked: 4 },
      { name: "Navigation evening", date: addDays(t, 24), capacity: 16, booked: 9 },
      { name: "", date: addDays(t, 30), capacity: 10, booked: 0 },
      { name: "", date: addDays(t, 40), capacity: 10, booked: 0 },
    ],
  };
  const form =
    field("number", "target", "Target fill (%)", state.target, { attrs: { min: 10, max: 100, step: 5 } }) +
    state.rows
      .map(
        (r, i) => `<fieldset class="pkst-day"><legend class="pkst-label">Course or session ${i + 1}</legend>
        ${field("text", "name", "Name", r.name, { row: i, attrs: { maxlength: 50 } })}
        <div class="pkst-row3">
          ${field("date", "date", "Date", r.date, { row: i })}
          ${field("number", "capacity", "Places", r.capacity, { row: i, attrs: { min: 1, max: 10000, step: 1 } })}
          ${field("number", "booked", "Booked", r.booked, { row: i, attrs: { min: 0, max: 10000, step: 1 } })}
        </div></fieldset>`,
      )
      .join("");
  const { result } = starterShell(root, links, {
    audience: "coastal-experts",
    audienceName: "Coastal Experts",
    type: "Planner",
    intro: "Fill your courses and sessions: see which one needs promoting first, how many places are left to fill, and when to push it. Two example sessions are filled in.",
    form,
  });
  const render = () => {
    const rows = sessionFill(state.rows, today(), state.target);
    if (!rows.length) {
      result.innerHTML = `<p class="pkst-eyebrow">PROMOTE FIRST</p><h3>Add a session to start.</h3>`;
      return;
    }
    const first = rows[0];
    result.innerHTML = `<p class="pkst-eyebrow">PROMOTE FIRST</p>
      <h3>${esc(first.name)}</h3>
      <p>${first.need ? `${first.need} more place${first.need === 1 ? "" : "s"} to reach ${esc(state.target)}%, ${first.days} day${first.days === 1 ? "" : "s"} to go.` : "On target."}</p>
      ${
        first.need && first.pushes.length
          ? `<ol class="pkst-timeline">${first.pushes.map((p) => `<li><span>${esc(shortDate(p.date).replace(/,? \d{4}$/, ""))}</span>${esc(p.what)}</li>`).join("")}</ol>`
          : first.need
            ? `<div class="pkst-fix"><p class="pkst-eyebrow">VERY CLOSE</p><p>Message past attendees directly today, and ask those booked to bring a friend.</p></div>`
            : ""
      }
      <ul class="pkst-bars pkst-bars-wide" aria-label="How full each session is" style="margin-top:16px">${rows
        .map((r) => `<li class="${r === first && r.need ? "is-worst" : ""}"><span>${r.fillPct}%</span><span class="pkst-bar" aria-hidden="true"><i style="width:${r.fillPct}%"></i><b style="left:${Math.min(100, state.target)}%"></b></span><span>${esc(r.name)}</span></li>`)
        .join("")}</ul>
      <p class="pkst-legend">Bar: places booked · gold line: your target.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
