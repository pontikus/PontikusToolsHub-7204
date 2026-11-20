import { impactSummary, num, type ImpactEntry } from "../web/lib/sea-lovers-tools";
import { esc } from "./core";
import { copyBlock, field, row2, today } from "./kit";
import { tracker } from "./tracker";

export const mount = tracker<ImpactEntry>({
  storageKey: "pkst-impact-log",
  intro: "Log each beach clean or litter pick: bags filled, weight, helpers and hours. Get a running total, and a summary you can copy into a post or a report.",
  noun: ["clean", "cleans"],
  draft: () => ({ date: today(), bags: 4, kg: 10, volunteers: 6, hours: 2 }),
  form: (d) =>
    field("date", "date", "Date", d.date) +
    row2(
      field("number", "bags", "Bags filled", d.bags, { attrs: { min: 0, max: 10000, step: 1 } }),
      field("number", "kg", "Weight (kg)", d.kg, { hint: "Leave at 0 if you didn't weigh.", attrs: { min: 0, max: 100000, step: 0.5 } }),
    ) +
    row2(
      field("number", "volunteers", "People who helped", d.volunteers, { attrs: { min: 1, max: 5000, step: 1 } }),
      field("number", "hours", "Hours", d.hours, { attrs: { min: 0.25, max: 24, step: 0.25 } }),
    ),
  toEntry: (d) =>
    d.date ? { date: String(d.date), bags: num(d.bags, 0, 10000), kg: num(d.kg, 0, 100000), volunteers: num(d.volunteers, 1, 5000), hours: num(d.hours, 0.25, 24) } : null,
  row: (e) => `${esc(e.bags)} bags · ${esc(e.kg)} kg · ${esc(e.volunteers)} people`,
  summary: (entries, links) => {
    const s = impactSummary(entries);
    if (!s.events) return `<p class="pkst-eyebrow">YOUR IMPACT</p><h3>Add your first clean.</h3><p>Your totals appear here once you have logged a clean. Planning one? Try the <a class="pkst-link" href="${esc(links.tool("beach-clean-planner"))}">Beach Clean Planner</a>.</p>`;
    const text = `Our impact so far: ${s.events} clean${s.events === 1 ? "" : "s"}, ${s.bags} bags${s.kg ? ` (${s.kg} kg)` : ""} of litter removed by ${s.people} helpers, giving ${s.volunteerHours} volunteer hours to the coast.`;
    return `<p class="pkst-eyebrow">YOUR IMPACT</p>
      <div class="pkst-score"><strong>${s.bags}</strong><span>bags removed</span></div>
      <ul class="pkst-list">
        <li>${s.events} clean${s.events === 1 ? "" : "s"}</li>
        ${s.kg ? `<li>${s.kg} kg of litter</li>` : ""}
        <li>${s.people} helpers, ${s.volunteerHours} volunteer hours</li>
      </ul>
      <p class="pkst-eyebrow" style="margin-top:18px">SHARE IT</p>
      ${copyBlock(text, "Copy the summary")}`;
  },
});
