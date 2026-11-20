import { overnightBudget } from "../web/lib/sea-lovers-tools";
import { defaultLinks, esc, type WidgetLinks } from "./core";
import { addLevels, atLeast, bindState, field, row2, selectField, site, starterShell, toolLevel } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const level = toolLevel(root, "sea-lovers");
  const full = atLeast(level, "level1");
  const state = { currency: "£", nights: 2, people: 2, pitch: 30, distance: 250, economy: 8, fuelPrice: 1.5, food: 20, ferries: 0, activities: 0, other: 0 };
  const n = (key: keyof typeof state, label: string, attrs: Record<string, number>, hint?: string) =>
    field("number", key, label, state[key], { attrs, hint });
  const form =
    row2(n("nights", "Nights", { min: 1, max: 60, step: 1 }), n("people", "People", { min: 1, max: 20, step: 1 })) +
    row2(selectField("currency", "Currency", [["£", "£"], ["€", "€"], ["$", "$"]], state.currency), n("pitch", "Pitch or parking, per night", { min: 0, step: 1 })) +
    row2(n("distance", "Round trip (km)", { min: 0, step: 10 }), n("economy", "Fuel use (litres per 100 km)", { min: 0, max: 50, step: 0.5 })) +
    row2(n("fuelPrice", "Fuel price per litre", { min: 0, step: 0.01 }), n("food", "Food per person, per day", { min: 0, step: 1 })) +
    (full
      ? `<h3 class="pkst-form-title" style="margin-top:6px">The rest of the trip</h3>` +
        row2(n("ferries", "Ferries, tolls and parking", { min: 0, step: 1 }), n("activities", "Activities and hire", { min: 0, step: 1 })) +
        n("other", "Anything else", { min: 0, step: 1 }, "Firewood, gas, showers, laundry.")
      : "");
  const { result } = starterShell(root, links, {
    audience: "sea-lovers",
    audienceName: "Sea Lovers",
    type: "Calculator",
    intro: "Add up a coastal overnight in a van, tent or campervan: pitches, fuel and food, with the total per night and per person.",
    form,
  });
  const calc = (s: typeof state) => {
    const b = overnightBudget({ nights: s.nights, people: s.people, pitchPerNight: s.pitch, distanceKm: s.distance, litresPer100: s.economy, fuelPrice: s.fuelPrice, foodPerPersonDay: s.food });
    const extras = full ? Number(s.ferries) + Number(s.activities) + Number(s.other) : 0;
    const total = b.total + extras;
    const nights = Math.max(1, Number(s.nights) || 1);
    const people = Math.max(1, Number(s.people) || 1);
    return { ...b, extras, total, perNight: total / nights, perPerson: total / people };
  };
  const money = (v: number, c = String(state.currency)) => c + v.toLocaleString("en-GB", { maximumFractionDigits: 0 });
  const render = () => {
    const b = calc(state);
    const parts: [string, number][] = [["Pitches", b.pitch], ["Fuel", b.fuel], ["Food", b.food], ...(full ? ([["Extras", b.extras]] as [string, number][]) : [])];
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
  const lv = addLevels(root, level, root.querySelector(".pkst-form")!, render, {
    slug: "coastal-overnight-budget-calculator",
    name: "Coastal Overnight Budget",
    audience: "sea-lovers",
    type: "Calculator",
    state,
    summary: () => {
      const b = calc(state);
      return [
        `Coastal overnight: ${state.nights} night${Number(state.nights) === 1 ? "" : "s"}, ${state.people} ${Number(state.people) === 1 ? "person" : "people"}`,
        `Total: ${money(b.total)} (${money(b.perNight)} per night, ${money(b.perPerson)} per person)`,
        `Pitches ${money(b.pitch)} · Fuel ${money(b.fuel)} · Food ${money(b.food)}${full ? ` · Extras ${money(b.extras)}` : ""}`,
      ].join("\n");
    },
    metrics: (s) => {
      const b = calc(s as typeof state);
      const c = String(s.currency);
      return [
        ["Total", b.total, money(b.total, c)],
        ["Per night", b.perNight, money(b.perNight, c)],
        ["Per person", b.perPerson, money(b.perPerson, c)],
        ["Fuel", b.fuel, money(b.fuel, c)],
        ["Pitches", b.pitch, money(b.pitch, c)],
        ["Food", b.food, money(b.food, c)],
      ];
    },
  });
  return () => {
    unbind();
    lv.destroy();
  };
}
