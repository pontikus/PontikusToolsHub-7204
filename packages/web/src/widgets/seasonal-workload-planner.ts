import { months } from "../web/lib/starter-tools";
import { workloadYear } from "../web/lib/coastal-experts-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, site, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  // Example year so the result is not empty on first load. The hint says to replace it.
  const state = { capacity: 20, rows: [6, 7, 12, 17, 22, 25, 26, 25, 19, 12, 7, 5].map((d) => ({ d })) };
  const form =
    field("number", "capacity", "Days you can work in a month", state.capacity, { attrs: { min: 1, max: 31, step: 1 } }) +
    `<fieldset class="pkst-field"><legend class="pkst-label">Days of work you usually have</legend>
      <span class="pkst-hint">An example year is filled in. Replace it with yours.</span>
      <div class="pkst-months">${months
        .map((m, i) => `<label>${m}<input type="number" inputmode="decimal" min="0" max="31" step="1" data-row="${i}" data-f="d" value="${state.rows[i].d}" aria-label="${m} days of work"></label>`)
        .join("")}</div></fieldset>`;
  const { result, levels } = starterShell(root, links, {
    audience: "coastal-experts",
    audienceName: "Coastal Experts",
    type: "Planner",
    intro: "See your year at a glance: the months you are overbooked, the months that go quiet, and how many days you could fill. For trades and marine crafts with a busy season.",
    form,
  });
  const render = () => {
    const r = workloadYear(state.rows.map((x) => x.d), state.capacity);
    const name = (i: number) => months[i];
    result.innerHTML = `<p class="pkst-eyebrow">YOUR YEAR</p>
      <ul class="pkst-bars" aria-label="Work against capacity by month">${r.months
        .map((m) => `<li class="${m.kind === "over" ? "is-worst" : ""}"><span>${name(m.i)}</span><span class="pkst-bar" aria-hidden="true"><i style="width:${Math.min(100, m.pct)}%"></i><b style="left:50%"></b></span><span>${m.pct}%</span></li>`)
        .join("")}</ul>
      <p class="pkst-legend">Bar: work against your capacity · gold line: half full.</p>
      ${r.over.length ? `<div class="pkst-fix"><p class="pkst-eyebrow">OVERBOOKED</p><p>${esc(r.over.map((m) => name(m.i)).join(", "))}: ${r.overDays} day${r.overDays === 1 ? "" : "s"} more than you can work. Book these earlier, raise your rate, or bring in help.</p></div>` : ""}
      ${
        r.quiet.length
          ? `<p style="margin-top:14px"><b>Quiet months:</b> ${esc(r.quiet.map((m) => name(m.i)).join(", "))}, with about ${r.quietDays} days free. Move indoor work, maintenance and training here.</p>
             <p class="pkst-note">Want to know if the quiet months cover their costs? <a class="pkst-link" href="${esc(site("/calculators/off-season-break-even-calculator"))}">The Off-Season Break-Even Calculator</a> works out the shortfall.</p>`
          : `<p style="margin-top:14px">No month is under half full.</p>`
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
