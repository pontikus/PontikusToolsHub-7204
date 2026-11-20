import { eventBreakEven } from "../web/lib/shoreline-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, row2, selectField, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { currency: "£", fixed: 3500, price: 20, perHead: 4, feesPct: 5, capacity: 300, expected: 220 };
  const form =
    row2(field("number", "fixed", "Fixed costs", state.fixed, { hint: "Venue, licences, staff, marketing, equipment.", attrs: { min: 0, step: 50 } }), selectField("currency", "Currency", [["£", "£"], ["€", "€"], ["$", "$"]], state.currency)) +
    row2(field("number", "price", "Ticket price", state.price, { attrs: { min: 0, step: 1 } }), field("number", "perHead", "Cost per person", state.perHead, { hint: "Food, drink, wristband, giveaways.", attrs: { min: 0, step: 0.5 } })) +
    `<div class="pkst-row3">${field("number", "feesPct", "Ticket fees (%)", state.feesPct, { attrs: { min: 0, max: 50, step: 0.5 } })}${field("number", "capacity", "Capacity", state.capacity, { attrs: { min: 0, step: 10 } })}${field("number", "expected", "Expected", state.expected, { attrs: { min: 0, step: 10 } })}</div>`;
  const { result } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Calculator",
    intro: "Know how many tickets you must sell before the event makes money, and what you'll make if sales are slow, as expected, or sold out.",
    form,
  });
  const render = () => {
    const r = eventBreakEven(state);
    const m = (v: number) => esc((v < 0 ? "−" : "") + state.currency + Math.abs(Math.round(v)).toLocaleString("en-GB"));
    if (r.breakEven === null) {
      result.innerHTML = `<p class="pkst-eyebrow">BREAK-EVEN</p><h3>Each ticket loses money.</h3><div class="pkst-fix"><p>After fees, each ticket brings in ${m(r.net)}. Raise the price or cut the cost per person.</p></div>`;
      return;
    }
    const row = (label: string, x: { n: number; profit: number }) => `<li class="${x.profit < 0 ? "is-weak" : ""}"><span>${x.n}</span><b>${label}</b><div>${x.profit < 0 ? "Loss of " : "Profit of "}${m(Math.abs(x.profit))}</div></li>`;
    result.innerHTML = `<p class="pkst-eyebrow">TICKETS TO BREAK EVEN</p>
      <div class="pkst-score"><strong>${r.breakEven}</strong><span>${r.breakEvenPct !== null ? `${r.breakEvenPct}% of capacity` : ""}</span></div>
      <p>Each ticket brings in ${m(r.net)} after fees and the cost per person.</p>
      <ol class="pkst-tips">
        ${row("Slow sales (three quarters of expected)", r.range.low)}
        ${row("As expected", r.range.expected)}
        ${r.range.sellOut ? row("Sold out", r.range.sellOut) : ""}
      </ol>
      ${
        !r.possible
          ? `<div class="pkst-fix"><p class="pkst-eyebrow">CAN'T BREAK EVEN</p><p>You need more tickets than you have room for. Raise the price, add sponsorship, or cut fixed costs.</p></div>`
          : r.range.expected.profit < 0
            ? `<div class="pkst-fix"><p class="pkst-eyebrow">BELOW BREAK-EVEN</p><p>Your expected sales fall ${r.breakEven - r.range.expected.n} short. Sell early-bird tickets to see demand before you commit to the big costs.</p></div>`
            : ""
      }`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
