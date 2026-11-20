import { intakeDocuments, intakeSheet } from "../web/lib/coastal-experts-tools";
import { defaultLinks, type WidgetLinks } from "./core";
import { bindState, checkList, copyBlock, field, row2, selectField, starterShell } from "./kit";

const types: [string, string][] = ["Licensing or permits", "Planning or consents", "Contract dispute", "Property or moorings", "Employment", "Environmental", "Other"].map((t) => [t, t]);

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { client: "", contact: "", matterType: types[0][0], issue: "", jurisdiction: "", deadline: "", otherParties: "", documents: [] as string[] };
  const form =
    row2(field("text", "client", "Client", state.client, { attrs: { maxlength: 60 } }), field("text", "contact", "Contact details", state.contact, { attrs: { maxlength: 60 } })) +
    selectField("matterType", "Type of matter", types, state.matterType) +
    `<label class="pkst-field"><span class="pkst-label">The issue, in the client's words</span><textarea data-k="issue" rows="4" maxlength="800"></textarea></label>` +
    row2(field("text", "jurisdiction", "Jurisdiction", state.jurisdiction, { attrs: { maxlength: 40 } }), field("text", "deadline", "Key date or deadline", state.deadline, { attrs: { maxlength: 40 } })) +
    field("text", "otherParties", "Other parties", state.otherParties, { attrs: { maxlength: 100 } }) +
    checkList("documents", "Documents the client has sent", intakeDocuments.map((d) => [d, d]), state.documents);
  const { result, levels } = starterShell(root, links, {
    audience: "coastal-experts",
    audienceName: "Coastal Experts",
    type: "Generator",
    intro: "Turn a first call into a clear intake sheet to confirm with the client, with the questions to ask about anything still missing.",
    form,
  });
  const render = () => {
    const r = intakeSheet(state);
    result.innerHTML = `<p class="pkst-eyebrow">YOUR INTAKE SHEET</p>${copyBlock(r.text, "Copy the sheet")}
      <p class="pkst-note">Send it to the client to confirm before you start work.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render);
  return () => {
    unbind();
    lv.destroy();
  };
}
