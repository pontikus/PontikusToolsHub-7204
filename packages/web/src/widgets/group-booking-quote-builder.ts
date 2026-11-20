import { groupQuote } from "../web/lib/shoreline-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, copyBlock, field, row2, selectField, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = {
    currency: "£", business: "", client: "", date: "", route: "", groupSize: 12, basePrice: 350, perPerson: 25, discountPct: 0, depositPct: 25, validDays: 14,
    rows: [
      { label: "Lunch on board", price: 15, perPerson: "yes" },
      { label: "", price: 0, perPerson: "no" },
      { label: "", price: 0, perPerson: "no" },
    ],
  };
  const form =
    row2(field("text", "business", "Your business", state.business, { attrs: { maxlength: 60 } }), field("text", "client", "Group or organiser", state.client, { attrs: { maxlength: 60 } })) +
    row2(field("date", "date", "Date", state.date), field("number", "groupSize", "Group size", state.groupSize, { attrs: { min: 1, max: 1000, step: 1 } })) +
    field("text", "route", "Route or plan", state.route, { attrs: { maxlength: 100, placeholder: "Three-hour bay trip with a swim stop" } }) +
    row2(field("number", "basePrice", "Base price for the booking", state.basePrice, { attrs: { min: 0, step: 10 } }), field("number", "perPerson", "Price per guest", state.perPerson, { attrs: { min: 0, step: 1 } })) +
    state.rows
      .map(
        (r, i) => `<div class="pkst-row3">${field("text", "label", `Extra ${i + 1}`, r.label, { row: i, attrs: { maxlength: 40 } })}${field("number", "price", "Price", r.price, { row: i, attrs: { min: 0, step: 5 } })}${selectFieldRow(i, r.perPerson)}</div>`,
      )
      .join("") +
    `<div class="pkst-row3">${field("number", "discountPct", "Group discount (%)", state.discountPct, { attrs: { min: 0, max: 50, step: 5 } })}${field("number", "depositPct", "Deposit (%)", state.depositPct, { attrs: { min: 0, max: 100, step: 5 } })}${field("number", "validDays", "Valid for (days)", state.validDays, { attrs: { min: 1, max: 90, step: 1 } })}</div>` +
    selectField("currency", "Currency", [["£", "£"], ["€", "€"], ["$", "$"]], state.currency);
  const { result } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Generator",
    intro: "Reply to a group enquiry the same day. Add the group size, date, plan and extras, and get a clear quote with the total, the price per guest and the deposit.",
    form,
  });
  const render = () => {
    const r = groupQuote({ ...state, extras: state.rows.map((x) => ({ label: x.label, price: x.price, perPerson: x.perPerson === "yes" })) });
    const m = (v: number) => esc(state.currency + Math.round(v).toLocaleString("en-GB"));
    result.innerHTML = `<p class="pkst-eyebrow">QUOTE TOTAL</p>
      <div class="pkst-score"><strong>${m(r.total)}</strong><span>${m(r.perHead)} per guest</span></div>
      ${r.deposit ? `<p>Deposit to secure the date: ${m(r.deposit)}</p>` : ""}
      <p class="pkst-eyebrow" style="margin-top:16px">READY TO SEND</p>${copyBlock(r.text, "Copy the quote")}`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}

function selectFieldRow(i: number, value: string) {
  return selectField("perPerson", "Charged", [["no", "Once"], ["yes", "Per guest"]], value, { row: i });
}
