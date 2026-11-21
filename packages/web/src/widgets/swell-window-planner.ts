import { duration, swellWindows, toClock, type SwellDay } from "../web/lib/sea-lovers-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, selectField, site, starterShell } from "./kit";

const quality: [string, string][] = [["1", "Rideable"], ["2", "Good"], ["3", "Firing"]];
const qualityName = (q: number) => quality[q - 1][1];

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  // Example rows so the result is not empty on first load. The intro says to replace them.
  const state = {
    rows: [
      { day: "Saturday", freeFrom: "06:00", freeTo: "13:00", goodFrom: "07:00", goodTo: "10:00", quality: "2" },
      { day: "Sunday", freeFrom: "09:00", freeTo: "18:00", goodFrom: "15:00", goodTo: "19:00", quality: "3" },
      { day: "Monday", freeFrom: "17:30", freeTo: "21:00", goodFrom: "06:00", goodTo: "11:00", quality: "2" },
    ],
  };
  const form =
    `<h3 class="pkst-form-title">Your next three days</h3>` +
    state.rows
      .map(
        (r, i) => `<fieldset class="pkst-day"><legend class="pkst-label">Day ${i + 1}</legend>
        ${field("text", "day", "Day", r.day, { row: i, attrs: { maxlength: 20 } })}
        <div class="pkst-row2">
          ${field("time", "freeFrom", "Free from", r.freeFrom, { row: i })}
          ${field("time", "freeTo", "Free until", r.freeTo, { row: i })}
        </div>
        <div class="pkst-row2">
          ${field("time", "goodFrom", "Good conditions from", r.goodFrom, { row: i })}
          ${field("time", "goodTo", "Good conditions until", r.goodTo, { row: i })}
        </div>
        ${selectField("quality", "How good does it look?", quality, r.quality, { row: i })}
      </fieldset>`,
      )
      .join("");
  const { result, levels } = starterShell(root, links, {
    audience: "sea-lovers",
    audienceName: "Sea Lovers",
    type: "Planner",
    intro:
      "Match the hours you are free with the hours the forecast looks good, and see which session to go for. Example days are filled in: replace them with yours, using the forecast you already trust.",
    form,
  });
  const render = () => {
    const days: SwellDay[] = state.rows.map((r) => ({ ...r, quality: Number(r.quality) as 1 | 2 | 3 }));
    const windows = swellWindows(days);
    const missing = state.rows.filter((r) => !windows.some((w) => w.day === r.day)).map((r) => r.day || "A day");
    const best = windows[0];
    const others = windows
      .slice(1)
      .map((w) => `<li><b>${esc(w.day)}</b> ${toClock(w.start)} to ${toClock(w.end)} · ${duration(w.minutes)} · ${qualityName(w.quality)}</li>`)
      .join("");
    result.innerHTML = best
      ? `<p class="pkst-eyebrow">YOUR BEST WINDOW</p>
        <h3>${esc(best.day)}, ${toClock(best.start)} to ${toClock(best.end)}</h3>
        <p>${duration(best.minutes)} in the water while it looks ${qualityName(best.quality).toLowerCase()}.</p>
        <div class="pkst-fix"><p class="pkst-eyebrow">BEFORE YOU GO</p><p>Check the forecast again on the morning, and allow time to get there and change: be in the water by ${toClock(best.start)}.</p></div>
        ${others ? `<p class="pkst-eyebrow" style="margin-top:18px">ALSO WORTH IT</p><ul class="pkst-list">${others}</ul>` : ""}
        ${missing.length ? `<p class="pkst-note">No window of 30 minutes or more on: ${esc(missing.join(", "))}.</p>` : ""}
        <p class="pkst-note">Planning a trip rather than a session? <a class="pkst-link" href="${esc(site("/boatyard/coastal-season-planner"))}">The Coastal Season Planner</a> shows the best month to go.</p>`
      : `<p class="pkst-eyebrow">YOUR BEST WINDOW</p><h3>No window this time.</h3>
        <p>None of your free time overlaps good conditions for 30 minutes or more. Try moving your free time, or look further ahead.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render);
  return () => {
    unbind();
    lv.destroy();
  };
}
