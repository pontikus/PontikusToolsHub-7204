import { jobQuote, type Contingency } from "../web/lib/coastal-experts-tools";
import { choiceGroup, defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, row2, selectField, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { currency: "£", materials: 800, markupPct: 15, hours: 16, hourly: 45, travel: 60, marginPct: 20, riskItems: 0, contingency: "low" as Contingency };
  const form =
    row2(field("number", "materials", "Materials (cost to you)", state.materials, { attrs: { min: 0, step: 10 } }), selectField("currency", "Currency", [["£", "£"], ["€", "€"], ["$", "$"]], state.currency)) +
    field("number", "markupPct", "Markup on materials (%)", state.markupPct, { attrs: { min: 0, max: 300, step: 5 } }) +
    row2(field("number", "hours", "Hours of work", state.hours, { attrs: { min: 0, step: 0.5 } }), field("number", "hourly", "Your hourly rate", state.hourly, { attrs: { min: 0, step: 1 } })) +
    row2(field("number", "travel", "Travel and access", state.travel, { hint: "Fuel, ferry, boat hire, parking.", attrs: { min: 0, step: 10 } }), field("number", "marginPct", "Margin you want (%)", state.marginPct, { attrs: { min: 0, max: 90, step: 1 } })) +
    `<h3 class="pkst-form-title" style="margin-top:6px">If conditions are uncertain</h3>` +
    field("number", "riskItems", "Known risk items", state.riskItems, { hint: "Things that may or may not be needed: hidden rot, extra fixings, a second visit.", attrs: { min: 0, step: 10 } }) +
    choiceGroup("contingency", "Contingency", [["none", "None"], ["low", "Low · 10%"], ["medium", "Medium · 20%"], ["high", "High · 30%"]], state.contingency);
  const { result } = starterShell(root, links, {
    audience: "coastal-experts",
    audienceName: "Coastal Experts",
    type: "Calculator",
    intro: "Price a job so the materials, time and travel are all covered and the margin you want is left. When site conditions are uncertain, get a quote range with the contingency shown.",
    form,
  });
  const render = () => {
    const r = jobQuote(state);
    const m = (v: number) => esc(state.currency + Math.round(v).toLocaleString("en-GB"));
    const range = r.high > r.quote + 0.5;
    result.innerHTML = `<p class="pkst-eyebrow">${range ? "QUOTE RANGE" : "YOUR QUOTE"}</p>
      <div class="pkst-score"><strong>${m(r.quote)}${range ? `–${m(r.high)}` : ""}</strong></div>
      <p>Leaves ${m(r.marginAmount)} margin at the lower figure.</p>
      <ul class="pkst-list" style="margin-top:12px">
        <li>Materials with markup: ${m(r.materials)}</li>
        <li>Labour: ${m(r.labour)}</li>
        <li>Travel and access: ${m(state.travel)}</li>
        <li>Total cost: ${m(r.cost)}</li>
      </ul>
      ${range ? `<div class="pkst-fix"><p class="pkst-eyebrow">ON THE QUOTE</p><p>Show the lower figure as the price, and the upper figure as the most it could reach if the risk items are needed and with a ${r.contingencyPct}% contingency. Agree that extra work is confirmed before it starts.</p></div>` : ""}`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
