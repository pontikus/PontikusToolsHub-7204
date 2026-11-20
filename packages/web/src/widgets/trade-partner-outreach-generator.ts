import { outreachMessages, partnerTypes, type PartnerType } from "../web/lib/shoreline-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, checkList, copyBlock, field, row2, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { event: "", date: "", place: "", audience: "", gain: "", sender: "", types: ["accommodation", "food"] as string[] };
  const form =
    row2(field("text", "event", "Event", state.event, { attrs: { maxlength: 60, placeholder: "Harbour Food Festival" } }), field("text", "date", "Date", state.date, { attrs: { maxlength: 40, placeholder: "Saturday 6 June" } })) +
    row2(field("text", "place", "Where", state.place, { attrs: { maxlength: 60 } }), field("text", "audience", "Who it's for", state.audience, { attrs: { maxlength: 60, placeholder: "families and food lovers" } })) +
    field("text", "gain", "What partners get", state.gain, { hint: "A logo on the poster, a stall, tickets, a mention on stage.", attrs: { maxlength: 100 } }) +
    field("text", "sender", "Your name and business", state.sender, { attrs: { maxlength: 60 } }) +
    checkList("types", "Partners to contact", (Object.keys(partnerTypes) as PartnerType[]).map((k) => [k, partnerTypes[k].label]), state.types);
  const { result } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Generator",
    intro: "Get local businesses and groups to help your event sell out. Pick who to contact and get a short outreach message for each, ready to send.",
    form,
  });
  const render = () => {
    const msgs = outreachMessages({ ...state, types: state.types as PartnerType[] });
    result.innerHTML = `<p class="pkst-eyebrow">YOUR OUTREACH MESSAGES</p>${
      msgs.length
        ? msgs.map((x) => `<h4 style="margin:14px 0 6px">${esc(x.label)}</h4>${copyBlock(x.text, "Copy")}`).join("")
        : `<h3>Pick at least one type of partner.</h3>`
    }
      <p class="pkst-note">Send them six to eight weeks before the event, and follow up once a week later.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
