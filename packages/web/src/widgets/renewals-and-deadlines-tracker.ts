import { deadlineList, type Deadline } from "../web/lib/coastal-experts-tools";
import { num } from "../web/lib/sea-lovers-tools";
import { esc } from "./core";
import { field, row2, selectField, shortDate, today } from "./kit";
import { tracker } from "./tracker";

const label = { overdue: "Overdue", start: "Start now", upcoming: "Upcoming" } as const;

export const mount = tracker<Deadline>({
  audience: "coastal-experts",
  audienceName: "Coastal Experts",
  addLabel: "Add deadline",
  storageKey: "pkst-renewals-and-deadlines",
  intro: "Keep every renewal and regulatory deadline in one list, for you or for your clients: licences, registrations, insurance, certificates and filings. See what is overdue and what to start now.",
  noun: ["deadline", "deadlines"],
  draft: () => ({ date: "", item: "", forWhom: "Me", leadDays: 30 }),
  form: (d) =>
    field("text", "item", "What needs renewing or filing", d.item, { attrs: { maxlength: 60, placeholder: "Professional indemnity insurance" } }) +
    field("text", "forWhom", "For", d.forWhom, { hint: "Me, or the client's name.", attrs: { maxlength: 40 } }) +
    row2(field("date", "date", "Due date", d.date), selectField("leadDays", "Start this far ahead", [["7", "1 week"], ["14", "2 weeks"], ["30", "1 month"], ["60", "2 months"], ["90", "3 months"]], String(d.leadDays))),
  toEntry: (d) => (d.date && String(d.item).trim() ? { date: String(d.date), item: String(d.item).trim(), forWhom: String(d.forWhom).trim() || "Me", leadDays: num(d.leadDays, 0, 365) } : null),
  row: (e) => `${esc(e.item)} · ${esc(e.forWhom)}`,
  summary: (entries) => {
    if (!entries.length) return `<p class="pkst-eyebrow">WHAT IS DUE</p><h3>Add your first deadline.</h3><p>Your list appears here, soonest first.</p>`;
    const list = deadlineList(entries, today());
    const overdue = list.filter((x) => x.status === "overdue").length;
    const start = list.filter((x) => x.status === "start").length;
    return `<p class="pkst-eyebrow">WHAT IS DUE</p>
      <div class="pkst-score"><strong>${overdue + start}</strong><span>need action now</span></div>
      <ol class="pkst-tips">${list
        .map(
          (x) => `<li class="${x.status === "overdue" ? "is-weak" : ""}"><span>${esc(label[x.status])}</span><b>${esc(x.item)} · ${esc(x.forWhom)}</b><div>Due ${esc(shortDate(x.date))}${
            x.status === "overdue" ? `, ${-x.left} day${x.left === -1 ? "" : "s"} ago` : x.status === "start" ? `, in ${x.left} day${x.left === 1 ? "" : "s"}` : `. Start by ${esc(shortDate(x.startBy))}`
          }</div></li>`,
        )
        .join("")}</ol>`;
  },
});
