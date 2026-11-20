import { divePlanText } from "../web/lib/sea-lovers-tools";
import { choiceGroup, defaultLinks, type WidgetLinks } from "./core";
import { bindState, copyBlock, field, row2, starterShell, today } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { kind: "freedive", spot: "", date: today(), entry: "10:00", maxDepth: 8, minutes: 45, buddy: "", buddyPhone: "", shoreContact: "" };
  const form =
    choiceGroup("kind", "What kind of dive?", [["freedive", "Freediving or snorkelling"], ["scuba", "Scuba"]], state.kind) +
    field("text", "spot", "Dive spot", state.spot, { attrs: { maxlength: 60 } }) +
    row2(field("date", "date", "Date", state.date), field("time", "entry", "In the water at", state.entry)) +
    row2(
      field("number", "maxDepth", "Planned max depth (m)", state.maxDepth, { attrs: { min: 0, max: 100, step: 1 } }),
      field("number", "minutes", "Time in the water (min)", state.minutes, { attrs: { min: 5, max: 300, step: 5 } }),
    ) +
    row2(field("text", "buddy", "Buddy's name", state.buddy, { attrs: { maxlength: 40 } }), field("tel", "buddyPhone", "Buddy's phone", state.buddyPhone, { attrs: { maxlength: 30 } })) +
    field("text", "shoreContact", "Shore contact", state.shoreContact, { hint: "Someone on land who knows your plan and when to raise the alarm.", attrs: { maxlength: 40 } });
  const { result, levels } = starterShell(root, links, {
    audience: "sea-lovers",
    audienceName: "Sea Lovers",
    type: "Generator",
    intro: "Fill in your dive and get a plan to share with your buddy and your shore contact before you go in.",
    form,
  });
  const render = () => {
    result.innerHTML = `<p class="pkst-eyebrow">YOUR DIVE PLAN</p>
      ${copyBlock(divePlanText({ ...state, freedive: state.kind === "freedive" }), "Copy the plan")}
      <p class="pkst-note">Send it to your buddy and your shore contact, by message or email.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render);
  return () => {
    unbind();
    lv.destroy();
  };
}
