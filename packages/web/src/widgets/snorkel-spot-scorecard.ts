import { rankSpots, type SpotRating } from "../web/lib/sea-lovers-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, selectField, starterShell } from "./kit";

const scale: [string, string][] = Array.from({ length: 10 }, (_, i) => [String(10 - i), String(10 - i)]);
const advice = {
  access: "Check the way in and out before you go: steps, rocks, a sheltered exit, and where you can park.",
  conditions: "Wait for a calmer day, or go at slack water when the tide is turning. Clear, flat water makes the trip.",
  confidence: "Start somewhere shallow with a buddy, or join a guided snorkel before you try this one.",
} as const;

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = {
    rows: [
      { name: "Harbour wall", access: "8", conditions: "6", confidence: "8" },
      { name: "Rocky cove", access: "5", conditions: "8", confidence: "6" },
      { name: "", access: "5", conditions: "5", confidence: "5" },
    ],
  };
  const form =
    `<h3 class="pkst-form-title">Score up to three spots, 1 to 10</h3>` +
    state.rows
      .map(
        (r, i) => `<fieldset class="pkst-day"><legend class="pkst-label">Spot ${i + 1}</legend>
        ${field("text", "name", "Name", r.name, { row: i, attrs: { maxlength: 40, placeholder: "Add a spot" } })}
        <div class="pkst-row3">
          ${selectField("access", "Access", scale, r.access, { row: i })}
          ${selectField("conditions", "Conditions", scale, r.conditions, { row: i })}
          ${selectField("confidence", "Confidence", scale, r.confidence, { row: i })}
        </div>
      </fieldset>`,
      )
      .join("");
  const { result } = starterShell(root, links, {
    audience: "sea-lovers",
    audienceName: "Sea Lovers",
    type: "Assessment",
    intro: "Compare snorkel spots on how easy they are to get in and out of, how the water looks, and how confident you feel there. Two example spots are filled in.",
    form,
  });
  const render = () => {
    const spots: SpotRating[] = state.rows.map((r) => ({ name: r.name, access: Number(r.access), conditions: Number(r.conditions), confidence: Number(r.confidence) }));
    const ranked = rankSpots(spots);
    if (!ranked.length) {
      result.innerHTML = `<p class="pkst-eyebrow">YOUR BEST SPOT</p><h3>Name a spot to score it.</h3>`;
      return;
    }
    const best = ranked[0];
    result.innerHTML = `<p class="pkst-eyebrow">YOUR BEST SPOT</p>
      <h3>${esc(best.name)}</h3>
      <div class="pkst-score"><strong>${best.total}</strong><span>/ 100</span></div>
      <div class="pkst-fix"><p class="pkst-eyebrow">WATCH OUT FOR: ${esc(best.concern.toUpperCase())}</p><p>${esc(advice[best.concernKey])}</p></div>
      ${
        ranked.length > 1
          ? `<ol class="pkst-tips">${ranked
              .map((s) => `<li class="${s === best ? "" : ""}"><span>${s.total}</span><b>${esc(s.name)}</b><div>Main concern: ${esc(s.concern.toLowerCase())}</div></li>`)
              .join("")}</ol>`
          : ""
      }
      <p class="pkst-note">Never snorkel alone, and check the tide and the forecast on the day.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
