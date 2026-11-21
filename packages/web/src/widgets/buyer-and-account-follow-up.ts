import { accountFollowUps, type Account } from "../web/lib/shoreline-tools";
import { num } from "../web/lib/sea-lovers-tools";
import { esc } from "./core";
import { field, row2, selectField, shortDate, today } from "./kit";
import { tracker } from "./tracker";

const label = { "at risk": "At risk", due: "Due", ok: "On track" } as const;

export const mount = tracker<Account>({
  audience: "shoreline-businesses",
  audienceName: "Shoreline Businesses",
  addLabel: "Add buyer or account",
  storageKey: "pkst-buyer-and-account-follow-up",
  intro: "Keep wholesale buyers and regular trade accounts ordering. Log each one's last order and how often they usually order, and see who to call first, before they go quiet.",
  noun: ["account", "accounts"],
  draft: () => ({ date: today(), name: "", kind: "Trade account", gapDays: 14, value: 0 }),
  form: (d) =>
    row2(field("text", "name", "Buyer or account", d.name, { attrs: { maxlength: 60, placeholder: "Quayside Restaurant" } }), selectField("kind", "Type", [["Trade account", "Trade account"], ["Wholesale buyer", "Wholesale buyer"], ["New buyer", "New buyer"]], String(d.kind))) +
    row2(field("date", "date", "Last order", d.date), selectField("gapDays", "Usually orders every", [["7", "Week"], ["14", "2 weeks"], ["30", "Month"], ["60", "2 months"], ["90", "3 months"]], String(d.gapDays))) +
    field("number", "value", "Usual order value", d.value, { attrs: { min: 0, step: 10 } }),
  // One reminder per account, on the day the follow-up is due.
  events: (entries) =>
    entries.map((e) => {
      const d = new Date(`${e.date}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() + e.gapDays);
      return { date: d.toISOString().slice(0, 10), title: `Follow up: ${e.name} (${e.kind})`, remindDays: 0 };
    }),
  toEntry: (d) => (d.date && String(d.name).trim() ? { date: String(d.date), name: String(d.name).trim(), kind: String(d.kind), gapDays: num(d.gapDays, 1, 365), value: num(d.value) } : null),
  row: (e) => `${esc(e.name)} · ${esc(e.kind)}`,
  summary: (entries) => {
    if (!entries.length) return `<p class="pkst-eyebrow">WHO TO CALL</p><h3>Add your first buyer or account.</h3><p>Your call list appears here, most overdue first.</p>`;
    const r = accountFollowUps(entries, today());
    return `<p class="pkst-eyebrow">WHO TO CALL</p>
      <div class="pkst-score"><strong>${r.chase}</strong><span>to call now${r.atRiskValue ? ` · ${esc(Math.round(r.atRiskValue).toLocaleString("en-GB"))} in usual orders at risk` : ""}</span></div>
      <ol class="pkst-tips">${r.rows
        .map(
          (x) => `<li class="${x.status === "at risk" ? "is-weak" : ""}"><span>${esc(label[x.status])}</span><b>${esc(x.name)} · ${esc(x.kind)}</b><div>${
            x.status === "ok" ? `Next order expected around ${esc(shortDate(x.due))}.` : `Order was due ${esc(shortDate(x.due))}${x.late ? `, ${x.late} day${x.late === 1 ? "" : "s"} ago` : ", today"}. ${x.status === "at risk" ? "Call today and ask if anything has changed." : "A quick message: is it time to restock?"}`
          }</div></li>`,
        )
        .join("")}</ol>
      <p class="pkst-note">When they order, delete the row and add it again with the new date.</p>`;
  },
});
