import { dealStages, followUps, type Deal } from "../web/lib/coastal-experts-tools";
import { num } from "../web/lib/sea-lovers-tools";
import { esc } from "./core";
import { field, row2, selectField, shortDate, today } from "./kit";
import { tracker } from "./tracker";

export const mount = tracker<Deal>({
  audience: "coastal-experts",
  audienceName: "Coastal Experts",
  addLabel: "Add deal or lead",
  storageKey: "pkst-deal-and-lead-follow-up",
  intro: "Keep every enquiry and deal moving: its stage, its value and when to follow up next, with a prompt for what to say. Overdue follow-ups come first.",
  noun: ["deal", "deals"],
  draft: () => ({ date: today(), name: "", stage: dealStages[0], value: 0, gapDays: 5 }),
  form: (d) =>
    field("text", "name", "Client or deal", d.name, { attrs: { maxlength: 60, placeholder: "Marina survey, North Quay" } }) +
    row2(selectField("stage", "Stage", dealStages.map((s) => [s, s]), String(d.stage)), field("number", "value", "Value", d.value, { attrs: { min: 0, step: 100 } })) +
    row2(field("date", "date", "Last contact", d.date), selectField("gapDays", "Follow up after", [["2", "2 days"], ["3", "3 days"], ["5", "5 days"], ["7", "1 week"], ["14", "2 weeks"], ["30", "1 month"]], String(d.gapDays))),
  toEntry: (d) => (d.date && String(d.name).trim() ? { date: String(d.date), name: String(d.name).trim(), stage: String(d.stage), value: num(d.value), gapDays: num(d.gapDays, 1, 365) } : null),
  row: (e) => `${esc(e.name)} · ${esc(e.stage)}`,
  summary: (entries) => {
    if (!entries.length) return `<p class="pkst-eyebrow">YOUR FOLLOW-UPS</p><h3>Add your first deal or lead.</h3><p>Your follow-up list appears here, most urgent first.</p>`;
    const r = followUps(entries, today());
    return `<p class="pkst-eyebrow">OPEN PIPELINE</p>
      <div class="pkst-score"><strong>${esc(Math.round(r.pipeline).toLocaleString("en-GB"))}</strong><span>${r.overdue ? `· ${r.overdue} overdue` : "· nothing overdue"}</span></div>
      <ol class="pkst-tips">${r.rows
        .map(
          (x) => `<li class="${x.overdue ? "is-weak" : ""}"><span>${x.open ? esc(shortDate(x.next)) : esc(x.stage)}</span><b>${esc(x.name)} · ${esc(x.stage)}</b><div>${x.open ? esc(x.prompt) : "Closed."}</div></li>`,
        )
        .join("")}</ol>
      <p class="pkst-note">When you follow up, delete the row and add it again with today's date and the new stage.</p>`;
  },
});
