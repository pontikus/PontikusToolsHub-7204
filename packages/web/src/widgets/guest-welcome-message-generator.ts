import { welcomeLonger } from "../web/lib/longer-formats";
import { welcomeMessage, type Welcome } from "../web/lib/shoreline-tools";
import { choiceGroup, defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, copyBlock, field, row2, starterShell, textArea } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state: Welcome = {
    property: "", guest: "", arrival: "", checkIn: "15:00", checkOut: "10:00", access: "", parking: "",
    wifiName: "", wifiPassword: "", houseNotes: "", host: "", contact: "", tone: "warm",
  };
  const form =
    row2(field("text", "property", "Property", state.property, { attrs: { maxlength: 60, placeholder: "Harbour Loft" } }), field("text", "guest", "Guest's first name", state.guest, { attrs: { maxlength: 40 } })) +
    field("text", "arrival", "Arrival day", state.arrival, { attrs: { maxlength: 40, placeholder: "Friday 4 December" } }) +
    row2(field("time", "checkIn", "Check-in from", state.checkIn), field("time", "checkOut", "Check-out by", state.checkOut)) +
    textArea("access", "How to get in", state.access, { rows: 2, placeholder: "Key safe by the blue door, code sent on the day." }) +
    field("text", "parking", "Parking", state.parking, { attrs: { maxlength: 120 } }) +
    row2(field("text", "wifiName", "Wi-Fi name", state.wifiName, { attrs: { maxlength: 40 } }), field("text", "wifiPassword", "Wi-Fi password", state.wifiPassword, { attrs: { maxlength: 40 } })) +
    textArea("houseNotes", "House notes", state.houseNotes, { hint: "One per line: bins, heating, tide times, the best café.", rows: 4 }) +
    row2(field("text", "host", "Your name", state.host, { attrs: { maxlength: 40 } }), field("tel", "contact", "Contact number", state.contact, { attrs: { maxlength: 30 } })) +
    choiceGroup("tone", "Tone", [["warm", "Warm"], ["short", "Short"]], state.tone);
  const { result, levels } = starterShell(root, links, {
    audience: "shoreline-businesses",
    audienceName: "Shoreline Businesses",
    type: "Generator",
    intro: "Answer the questions guests always ask, before they ask them. Fill in the arrival details once and get a friendly message ready to send.",
    form,
  });
  const render = () => {
    const r = welcomeMessage(state);
    result.innerHTML = `<p class="pkst-eyebrow">YOUR WELCOME MESSAGE</p>${copyBlock(r.text, "Copy the message")}
      ${r.missing.length ? `<div class="pkst-fix"><p class="pkst-eyebrow">STILL TO ADD</p><p>Add ${esc(r.missing.join(", "))}, so the guest doesn't need to message you.</p></div>` : `<p class="pkst-note">Send it the day before arrival, by text, email or your booking platform.</p>`}`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render, {
    longer: () => welcomeLonger(state),
  });
  return () => {
    unbind();
    lv.destroy();
  };
}
