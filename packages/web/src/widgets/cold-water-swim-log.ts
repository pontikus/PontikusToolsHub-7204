import { num, swimLogSummary, type SwimEntry } from "../web/lib/sea-lovers-tools";
import { esc } from "./core";
import { field, row2, selectField, shortDate, today } from "./kit";
import { tracker } from "./tracker";

const feel: [string, string][] = [["5", "Brilliant"], ["4", "Good"], ["3", "Fine"], ["2", "Hard work"], ["1", "Too cold"]];
const trendText = { up: "Your swims are getting longer.", down: "Your swims are getting shorter, which is normal as the water cools.", steady: "Your swim times are holding steady." };

export const mount = tracker<SwimEntry>({
  storageKey: "pkst-cold-water-swim-log",
  intro: "Log each cold water swim: the water temperature, how long you were in and how it felt. See your coldest and longest swims and which way your times are heading.",
  noun: ["swim", "swims"],
  draft: () => ({ date: today(), tempC: 12, minutes: 10, feel: "4" }),
  form: (d) =>
    field("date", "date", "Date", d.date) +
    row2(
      field("number", "tempC", "Water temperature (°C)", d.tempC, { attrs: { min: -2, max: 35, step: 0.5 } }),
      field("number", "minutes", "Minutes in the water", d.minutes, { attrs: { min: 1, max: 240, step: 1 } }),
    ) +
    selectField("feel", "How did it feel?", feel, String(d.feel)),
  toEntry: (d) => (d.date ? { date: String(d.date), tempC: num(d.tempC, -2, 35), minutes: num(d.minutes, 1, 240), feel: num(d.feel, 1, 5) } : null),
  row: (e) => `${esc(e.tempC)}°C · ${esc(e.minutes)} min · ${esc(feel.find(([v]) => Number(v) === e.feel)?.[1] ?? "")}`,
  summary: (entries, links) => {
    const s = swimLogSummary(entries);
    if (!s) return `<p class="pkst-eyebrow">YOUR SWIMS</p><h3>Add your first swim.</h3><p>Your summary appears here once you have logged a swim.</p>`;
    return `<p class="pkst-eyebrow">YOUR SWIMS</p>
      <div class="pkst-score"><strong>${s.count}</strong><span>swim${s.count === 1 ? "" : "s"} logged</span></div>
      <ul class="pkst-list">
        <li>Average: ${s.avgMinutes} min in ${s.avgTemp}°C</li>
        <li>Coldest: ${esc(s.coldest.tempC)}°C on ${esc(shortDate(s.coldest.date))}</li>
        <li>Longest: ${esc(s.longest.minutes)} min on ${esc(shortDate(s.longest.date))}</li>
      </ul>
      ${s.trend ? `<p style="margin-top:10px">${trendText[s.trend]}</p>` : `<p class="pkst-note">Log four swims to see which way your times are heading.</p>`}
      <p class="pkst-note">Build up slowly, never swim alone, and warm up gently afterwards. Want to keep a memorable one? <a class="pkst-link" href="${esc(links.tool("journal"))}">Turn a swim into a journal page</a>.</p>`;
  },
});
