import { commission } from "../web/lib/coastal-experts-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, row2, selectField, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { currency: "£", value: 250000, ratePct: 2, fees: 150, costs: 400, rows: [{ label: "Office or brokerage", pct: 30 }, { label: "Referral or co-broker", pct: 0 }] };
  const form =
    row2(field("number", "value", "Deal value", state.value, { attrs: { min: 0, step: 1000 } }), selectField("currency", "Currency", [["£", "£"], ["€", "€"], ["$", "$"]], state.currency)) +
    field("number", "ratePct", "Commission rate (%)", state.ratePct, { attrs: { min: 0, max: 100, step: 0.25 } }) +
    state.rows
      .map((r, i) => `<div class="pkst-row2">${field("text", "label", `Split ${i + 1}`, r.label, { row: i, attrs: { maxlength: 40 } })}${field("number", "pct", "Share of commission (%)", r.pct, { row: i, attrs: { min: 0, max: 100, step: 5 } })}</div>`)
      .join("") +
    row2(
      field("number", "fees", "Fees (listing, platform, card)", state.fees, { attrs: { min: 0, step: 10 } }),
      field("number", "costs", "Your costs on this deal", state.costs, { hint: "Travel, surveys, marketing.", attrs: { min: 0, step: 10 } }),
    );
  const { result } = starterShell(root, links, {
    audience: "coastal-experts",
    audienceName: "Coastal Experts",
    type: "Calculator",
    intro: "See what a deal really pays you once the commission is split and the fees and costs come off. For brokers and agents on boats, berths and coastal property.",
    form,
  });
  const render = () => {
    const r = commission({ ...state, splits: state.rows });
    const m = (v: number) => esc(state.currency + Math.round(v).toLocaleString("en-GB"));
    result.innerHTML = `<p class="pkst-eyebrow">YOU TAKE HOME</p>
      <div class="pkst-score"><strong>${m(r.net)}</strong></div>
      <p>${Math.round(r.keepPct)}% of the ${m(r.gross)} commission · ${r.effectivePct.toFixed(2)}% of the deal value</p>
      <ul class="pkst-list" style="margin-top:12px">
        <li>Gross commission: ${m(r.gross)}</li>
        ${r.splits.map((s) => `<li>${esc(s.label)} (${s.pct}%): −${m(s.amount)}</li>`).join("")}
        <li>Fees: −${m(state.fees)}</li>
        <li>Your costs: −${m(state.costs)}</li>
      </ul>
      ${r.net < 0 ? `<div class="pkst-fix"><p class="pkst-eyebrow">CHECK THIS DEAL</p><p>This deal costs you more than it pays.</p></div>` : ""}`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
