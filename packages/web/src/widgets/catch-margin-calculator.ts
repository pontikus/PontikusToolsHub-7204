import { catchMargins } from "../web/lib/shoreline-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, selectField, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = {
    currency: "£",
    rows: [
      { name: "Cod fillet", costPerKg: 6.5, yieldPct: 45, pricePerKg: 24 },
      { name: "Whole mackerel", costPerKg: 2.8, yieldPct: 100, pricePerKg: 6 },
      { name: "Crab meat", costPerKg: 4, yieldPct: 25, pricePerKg: 28 },
      { name: "", costPerKg: 0, yieldPct: 100, pricePerKg: 0 },
    ],
  };
  const form =
    selectField("currency", "Currency", [["£", "£"], ["€", "€"], ["$", "$"]], state.currency) +
    state.rows
      .map(
        (r, i) => `<fieldset class="pkst-day"><legend class="pkst-label">Product ${i + 1}</legend>
        ${field("text", "name", "Name", r.name, { row: i, attrs: { maxlength: 40 } })}
        <div class="pkst-row3">
          ${field("number", "costPerKg", "Cost per kg", r.costPerKg, { row: i, attrs: { min: 0, step: 0.1 } })}
          ${field("number", "yieldPct", "Yield (%)", r.yieldPct, { row: i, attrs: { min: 1, max: 100, step: 1 } })}
          ${field("number", "pricePerKg", "Sell per kg", r.pricePerKg, { row: i, attrs: { min: 0, step: 0.1 } })}
        </div></fieldset>`,
      )
      .join("");
  const { result } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Calculator",
    intro: "See what each product really earns once the weight lost in filleting, picking or trimming is counted. Yield is the share of what you buy that you can sell. Three examples are filled in.",
    form,
  });
  const render = () => {
    const r = catchMargins(state.rows);
    const m = (v: number) => esc((v < 0 ? "−" : "") + state.currency + Math.abs(v).toFixed(2));
    if (!r.rows.length) {
      result.innerHTML = `<p class="pkst-eyebrow">WEAKEST EARNER</p><h3>Add a product with a selling price.</h3>`;
      return;
    }
    const w = r.weakest!;
    result.innerHTML = `<p class="pkst-eyebrow">WEAKEST EARNER</p>
      <h3>${esc(w.name)}</h3>
      <p>${Math.round(w.marginPct)}% margin, ${m(w.margin)} per kg sold. It costs you ${m(w.trueCost)} per kg once yield is counted.</p>
      <ul class="pkst-bars pkst-bars-wide" aria-label="Margin by product" style="margin-top:14px">${r.rows
        .map((x) => `<li class="${x === w ? "is-worst" : ""}"><span>${Math.round(x.marginPct)}%</span><span class="pkst-bar" aria-hidden="true"><i style="width:${Math.max(0, Math.min(100, x.marginPct))}%"></i></span><span>${esc(x.name)}</span></li>`)
        .join("")}</ul>
      <p class="pkst-legend">Bar: margin as a share of the selling price.</p>
      <div class="pkst-fix"><p class="pkst-eyebrow">TO IMPROVE IT</p><p>${
        w.margin <= 0
          ? `You lose money on every kilo. You need at least ${m(w.breakEvenPrice)} per kg to break even.`
          : `Raise the price, buy at a better cost, or sell more of it whole or as a by-product (stock, bait, pet food) so less weight is wasted.`
      }</p></div>`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
