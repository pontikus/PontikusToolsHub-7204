import { retainerLonger } from "../web/lib/longer-formats";
import { retainerProposal } from "../web/lib/shoreline-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, copyBlock, field, row2, selectField, starterShell, textArea } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { client: "", agency: "", services: "", goals: "", hours: 16, fee: 1200, term: 6, notice: 30, currency: "£", extraRate: 75 };
  const form =
    row2(field("text", "client", "Client", state.client, { attrs: { maxlength: 60 } }), field("text", "agency", "Your business", state.agency, { attrs: { maxlength: 60 } })) +
    textArea("goals", "What the client wants to achieve", state.goals, { hint: "One per line.", rows: 3, placeholder: "More direct bookings in the shoulder season" }) +
    textArea("services", "What's included each month", state.services, { hint: "One per line.", rows: 4, placeholder: "8 social posts\nOne email newsletter\nMonthly report" }) +
    row2(field("number", "fee", "Monthly fee", state.fee, { attrs: { min: 0, step: 50 } }), field("number", "hours", "Hours a month", state.hours, { attrs: { min: 0, step: 1 } })) +
    `<div class="pkst-row3">${field("number", "term", "Minimum term (months)", state.term, { attrs: { min: 1, max: 36, step: 1 } })}${field("number", "notice", "Notice (days)", state.notice, { attrs: { min: 0, max: 180, step: 1 } })}${field("number", "extraRate", "Extra work, per hour", state.extraRate, { attrs: { min: 0, step: 5 } })}</div>` +
    selectField("currency", "Currency", [["£", "£"], ["€", "€"], ["$", "$"]], state.currency);
  const { result, levels } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Generator",
    intro: "Turn a one-off client into a monthly one. Set out the goals, what's included, the fee and the terms, and get a retainer proposal ready to send.",
    form,
  });
  const render = () => {
    const r = retainerProposal(state);
    result.innerHTML = `<p class="pkst-eyebrow">YOUR PROPOSAL</p>
      ${r.hourly ? `<p>Works out at ${esc(state.currency + Math.round(r.hourly).toLocaleString("en-GB"))} an hour.</p>` : ""}
      ${copyBlock(r.text, "Copy the proposal")}
      ${r.warnings.length ? `<div class="pkst-fix"><p class="pkst-eyebrow">CHECK BEFORE SENDING</p>${r.warnings.map((w) => `<p>${esc(w)}</p>`).join("")}</div>` : ""}`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render, {
    longer: () => retainerLonger(state),
  });
  return () => {
    unbind();
    lv.destroy();
  };
}
