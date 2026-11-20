import { overnightBudget } from "../web/lib/sea-lovers-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, row2, selectField, site, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { currency: "£", nights: 2, people: 2, pitch: 30, distance: 250, economy: 8, fuelPrice: 1.5, food: 20 };
  const n = (key: keyof typeof state, label: string, attrs: Record<string, number>, hint?: string) =>
    field("number", key, label, state[key], { attrs, hint });
  const form =
    row2(n("nights", "Nights", { min: 1, max: 60, step: 1 }), n("people", "People", { min: 1, max: 20, step: 1 })) +
    row2(selectField("currency", "Currency", [["£", "£"], ["€", "€"], ["$", "$"]], state.currency), n("pitch", "Pitch or parking, per night", { min: 0, step: 1 })) +
    row2(n("distance", "Round trip (km)", { min: 0, step: 10 }), n("economy", "Fuel use (litres per 100 km)", { min: 0, max: 50, step: 0.5 })) +
    row2(n("fuelPrice", "Fuel price per litre", { min: 0, step: 0.01 }), n("food", "Food per person, per day", { min: 0, step: 1 }));
  const { result } = starterShell(root, links, {
    audience: "sea-lovers",
    audienceName: "Sea Lovers",
    type: "Calculator",
    intro: "Add up a coastal overnight in a van, tent or campervan: pitches, fuel and food, with the total per night and per person.",
    form,
  });
  const render = () => {
    const b = overnightBudget({ nights: state.nights, people: state.people, pitchPerNight: state.pitch, distanceKm: state.distance, litresPer100: state.economy, fuelPrice: state.fuelPrice, foodPerPersonDay: state.food });
    const c = String(state.currency);
    const money = (v: number) => c + v.toLocaleString("en-GB", { maximumFractionDigits: 0 });
    const parts: [string, number][] = [["Pitches", b.pitch], ["Fuel", b.fuel], ["Food", b.food]];
    const max = Math.max(1, ...parts.map((p) => p[1]));
    result.innerHTML = `<p class="pkst-eyebrow">TRIP TOTAL</p>
      <div class="pkst-score"><strong>${esc(money(b.total))}</strong></div>
      <p>${esc(money(b.perNight))} per night · ${esc(money(b.perPerson))} per person</p>
      <ul class="pkst-bars pkst-bars-wide" aria-label="Where the money goes">${parts
        .map(([label, v]) => `<li><span>${label}</span><span class="pkst-bar" aria-hidden="true"><i style="width:${Math.round((v / max) * 100)}%"></i></span><span>${esc(money(v))}</span></li>`)
        .join("")}</ul>
      <p class="pkst-note">Food is counted for every day of the trip, including the day you drive home. Going further afield? <a class="pkst-link" href="${esc(site("/calculators/true-cruise-cost-calculator"))}">True Cruise Cost</a> and <a class="pkst-link" href="${esc(site("/calculators/gear-cost-calculator"))}">Gear Cost</a> cover the other big coastal costs.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
