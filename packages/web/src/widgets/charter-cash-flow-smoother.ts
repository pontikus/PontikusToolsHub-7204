import { charterCashFlow } from "../web/lib/shoreline-tools";
import { months } from "../web/lib/starter-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, row2, selectField, site, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const start = new Date().getMonth();
  const label = (i: number) => months[(start + i) % 12];
  // An example season so the result is not empty on first load. The hint says to replace it.
  const example = [1, 1, 2, 4, 8, 12, 16, 16, 9, 4, 1, 0];
  const state = {
    currency: "£", opening: 4000, price: 900, depositPct: 30, costPerCharter: 180, fixedMonthly: 2200,
    rows: Array.from({ length: 12 }, (_, i) => ({ n: example[(start + i) % 12] })),
  };
  const form =
    row2(field("number", "opening", "Money in the bank now", state.opening, { attrs: { step: 100 } }), selectField("currency", "Currency", [["£", "£"], ["€", "€"], ["$", "$"]], state.currency)) +
    row2(field("number", "price", "Average charter price", state.price, { attrs: { min: 0, step: 10 } }), field("number", "depositPct", "Deposit taken (%)", state.depositPct, { hint: "Paid the month before.", attrs: { min: 0, max: 100, step: 5 } })) +
    row2(
      field("number", "costPerCharter", "Cost per charter", state.costPerCharter, { hint: "Fuel, crew, cleaning.", attrs: { min: 0, step: 10 } }),
      field("number", "fixedMonthly", "Running costs a month", state.fixedMonthly, { hint: "Mooring, insurance, loan, wages.", attrs: { min: 0, step: 50 } }),
    ) +
    `<fieldset class="pkst-field"><legend class="pkst-label">Charters you expect each month</legend>
      <span class="pkst-hint">An example season is filled in. Replace it with yours.</span>
      <div class="pkst-months">${state.rows
        .map((r, i) => `<label>${label(i)}<input type="number" inputmode="decimal" min="0" max="999" step="1" data-row="${i}" data-f="n" value="${r.n}" aria-label="${label(i)} charters"></label>`)
        .join("")}</div></fieldset>`;
  const { result } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Calculator",
    intro: "See your bank balance month by month across the next year, with deposits coming in early and running costs going out every month. Find the tightest month before it arrives.",
    form,
  });
  const render = () => {
    const r = charterCashFlow({ ...state, bookings: state.rows.map((x) => x.n) });
    const m = (v: number) => esc((v < 0 ? "−" : "") + state.currency + Math.abs(Math.round(v)).toLocaleString("en-GB"));
    const max = Math.max(1, ...r.months.map((x) => Math.abs(x.balance)));
    const t = r.tightest;
    result.innerHTML = `<p class="pkst-eyebrow">TIGHTEST MONTH</p>
      <div class="pkst-score"><strong>${esc(label(t.i))}</strong><span>${m(t.balance)} in the bank</span></div>
      <ul class="pkst-bars pkst-bars-wide" aria-label="Bank balance at the end of each month">${r.months
        .map((x) => `<li class="${x.balance < 0 || x === t ? "is-worst" : ""}"><span>${esc(label(x.i))}</span><span class="pkst-bar" aria-hidden="true"><i style="width:${Math.round((Math.abs(x.balance) / max) * 100)}%"></i></span><span>${m(x.balance)}</span></li>`)
        .join("")}</ul>
      <p class="pkst-legend">Balance at the end of each month. Red: the tightest month${r.negative ? " and months below zero" : ""}.</p>
      ${
        r.negative
          ? `<div class="pkst-fix"><p class="pkst-eyebrow">CASH RUNS OUT</p><p>You go below zero in ${r.negative} month${r.negative === 1 ? "" : "s"}. Take bigger deposits, move a payment such as insurance to a busy month, or agree an overdraft before the season ends.</p></div>`
          : `<p style="margin-top:12px">You stay above zero all year and end on ${m(r.end)}. Keep at least one quiet month's running costs (${m(state.fixedMonthly)}) as a buffer.</p>`
      }
      <p class="pkst-note">For the quiet months in detail, try the <a class="pkst-link" href="${esc(site("/calculators/off-season-break-even-calculator"))}">Off-Season Break-Even Calculator</a>.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
