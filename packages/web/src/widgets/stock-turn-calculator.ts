import { stockTurn } from "../web/lib/shoreline-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, selectField, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = {
    currency: "£",
    rows: [
      { name: "Mooring ropes", stockValue: 2400, monthlySales: 300, leadWeeks: 3 },
      { name: "Antifouling paint", stockValue: 1800, monthlySales: 900, leadWeeks: 2 },
      { name: "Life jackets", stockValue: 3200, monthlySales: 250, leadWeeks: 4 },
      { name: "", stockValue: 0, monthlySales: 0, leadWeeks: 2 },
      { name: "", stockValue: 0, monthlySales: 0, leadWeeks: 2 },
    ],
  };
  const form =
    selectField("currency", "Currency", [["£", "£"], ["€", "€"], ["$", "$"]], state.currency) +
    state.rows
      .map(
        (r, i) => `<fieldset class="pkst-day"><legend class="pkst-label">Stock line ${i + 1}</legend>
        ${field("text", "name", "Name", r.name, { row: i, attrs: { maxlength: 40 } })}
        <div class="pkst-row3">
          ${field("number", "stockValue", "Stock at cost", r.stockValue, { row: i, attrs: { min: 0, step: 50 } })}
          ${field("number", "monthlySales", "Sold a month, at cost", r.monthlySales, { row: i, attrs: { min: 0, step: 10 } })}
          ${field("number", "leadWeeks", "Reorder takes (weeks)", r.leadWeeks, { row: i, attrs: { min: 0, max: 52, step: 1 } })}
        </div></fieldset>`,
      )
      .join("");
  const { result } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Calculator",
    intro: "Find the stock that ties up your cash. Enter what each line holds and sells a month, both at cost, and how long a reorder takes. Three example lines are filled in.",
    form,
  });
  const render = () => {
    const r = stockTurn(state.rows);
    const m = (v: number) => esc(state.currency + Math.round(v).toLocaleString("en-GB"));
    if (!r.rows.length) {
      result.innerHTML = `<p class="pkst-eyebrow">CASH TIED UP</p><h3>Add a stock line to start.</h3>`;
      return;
    }
    const weeks = (w: number) => (w === Infinity ? "no sales" : `${Math.round(w)} weeks of stock`);
    result.innerHTML = `<p class="pkst-eyebrow">CASH TIED UP IN EXTRA STOCK</p>
      <div class="pkst-score"><strong>${m(r.tiedUp)}</strong></div>
      <p>Stock beyond what you need to cover the reorder time plus two weeks.</p>
      <ol class="pkst-tips">${r.rows
        .map(
          (x) => `<li class="${r.slowest.includes(x) ? "is-weak" : ""}"><span>${x.turns.toFixed(1)}×</span><b>${esc(x.name)}</b><div>Turns ${x.turns.toFixed(1)} times a year · ${weeks(x.coverWeeks)}${x.excess > 0 ? ` · ${m(x.excess)} extra` : ""}</div></li>`,
        )
        .join("")}</ol>
      ${
        r.slowest.length
          ? `<div class="pkst-fix"><p class="pkst-eyebrow">SLOWEST MOVERS</p><p>${esc(r.slowest.map((x) => x.name).join(", "))}. Order smaller amounts more often, put them by the till or in a bundle, or clear old lines at the end of the season.</p></div>`
          : `<p style="margin-top:12px">No line holds more than it needs.</p>`
      }`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
