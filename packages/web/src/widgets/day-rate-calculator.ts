import { dayRate } from "../web/lib/coastal-experts-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, row2, selectField, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { currency: "£", income: 50000, overheads: 8000, travel: 3000, workingDays: 220, billablePct: 60, nichePct: 0 };
  const form =
    row2(field("number", "income", "Income you want, per year", state.income, { attrs: { min: 0, step: 1000 } }), selectField("currency", "Currency", [["£", "£"], ["€", "€"], ["$", "$"]], state.currency)) +
    row2(
      field("number", "overheads", "Overheads per year", state.overheads, { hint: "Insurance, software, office, memberships.", attrs: { min: 0, step: 100 } }),
      field("number", "travel", "Travel per year", state.travel, { hint: "Fuel, ferries, stays.", attrs: { min: 0, step: 100 } }),
    ) +
    row2(
      field("number", "workingDays", "Working days per year", state.workingDays, { attrs: { min: 1, max: 366, step: 1 } }),
      field("number", "billablePct", "Days you can bill (%)", state.billablePct, { hint: "The rest goes on admin and finding work.", attrs: { min: 1, max: 100, step: 5 } }),
    ) +
    field("number", "nichePct", "Specialist premium (%)", state.nichePct, { hint: "Optional: extra for scarce coastal or marine expertise.", attrs: { min: 0, max: 200, step: 5 } });
  const { result, levels } = starterShell(root, links, {
    audience: "coastal-experts",
    audienceName: "Coastal Experts",
    type: "Calculator",
    intro: "Work out the day rate that covers your income, overheads and travel, and the rate below which a day costs you money. For advisers, consultants and specialist trades.",
    form,
  });
  const render = () => {
    const r = dayRate(state);
    const m = (v: number) => esc(state.currency + Math.round(v).toLocaleString("en-GB"));
    result.innerHTML = `<p class="pkst-eyebrow">YOUR DAY RATE</p>
      <div class="pkst-score"><strong>${m(r.rate)}</strong><span>per day</span></div>
      <ul class="pkst-list"><li>Half day: ${m(r.halfDay)}</li><li>Hourly, on a 7.5-hour day: ${m(r.hourly)}</li><li>Billable days: ${r.billableDays} a year</li></ul>
      <div class="pkst-fix"><p class="pkst-eyebrow">BREAK-EVEN</p><h4>${m(r.breakEven)} a day</h4><p>Below this, a day's work does not cover its share of your overheads and travel, before you pay yourself anything.</p></div>
      <p class="pkst-note">Put your rate in front of clients with the <a class="pkst-link" href="${esc(links.tool("rate-card"))}">Rate Card Builder</a>.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render);
  return () => {
    unbind();
    lv.destroy();
  };
}
