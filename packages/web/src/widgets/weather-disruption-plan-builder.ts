import { fallbackOptions, weatherPlan } from "../web/lib/shoreline-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, checkList, copyBlock, field, row2, selectField, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = {
    business: "", services: "", atRisk: 10, decideHours: 12, triggers: "", channels: "text and email", refund: "",
    fallbacks: ["Move to another date", "Voucher for a later date"] as string[],
  };
  const form =
    row2(field("text", "business", "Your business", state.business, { attrs: { maxlength: 60 } }), field("text", "services", "What weather can stop", state.services, { attrs: { maxlength: 80, placeholder: "boat trips and paddleboard lessons" } })) +
    row2(
      field("number", "atRisk", "Bookings on a typical day", state.atRisk, { attrs: { min: 0, step: 1 } }),
      selectField("decideHours", "Decide this long before", [["2", "2 hours"], ["6", "6 hours"], ["12", "12 hours"], ["24", "1 day"], ["48", "2 days"]], String(state.decideHours)),
    ) +
    field("text", "triggers", "Your limits", state.triggers, { hint: "When you cancel: wind, swell, lightning, a warning.", attrs: { maxlength: 100, placeholder: "wind over 20 knots or swell over 1.5 m" } }) +
    checkList("fallbacks", "Options you offer", fallbackOptions.map((f) => [f, f]), state.fallbacks) +
    row2(field("text", "channels", "How you reach customers", state.channels, { attrs: { maxlength: 60 } }), field("text", "refund", "Refund terms (optional)", state.refund, { attrs: { maxlength: 100, placeholder: "Refunds go back to your card within 5 days." } }));
  const { result } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Planner",
    intro: "Be ready before the weather closes you. Set your limits, when you decide and what you offer, and get a one-page plan with a message to send customers.",
    form,
  });
  const render = () => {
    const r = weatherPlan(state);
    result.innerHTML = `<p class="pkst-eyebrow">ON A BAD-WEATHER DAY</p>
      <ol class="pkst-timeline">${r.steps.map((s) => `<li><span>${esc(s.when)}</span>${esc(s.what)}</li>`).join("")}</ol>
      <p class="pkst-eyebrow" style="margin-top:16px">MESSAGE TO CUSTOMERS</p>${copyBlock(r.message, "Copy the message")}
      <p class="pkst-eyebrow" style="margin-top:16px">THE WHOLE PLAN</p>${copyBlock(r.text, "Copy the plan")}
      <p class="pkst-note">Share the plan with your staff, and put your weather policy on your booking page so customers know before they book.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
