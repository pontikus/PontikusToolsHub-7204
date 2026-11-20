import { esc } from "./core";
import { item, kitChecker } from "./kit";

type S = { length: string; stay: string; season: string };

export const mount = kitChecker<S>({
  audience: "sea-lovers",
  audienceName: "Sea Lovers",
  intro: "Heading down the coast in a van or campervan? Tell us about the trip and get the essentials to pack and check.",
  questions: [
    ["length", "How long is the trip?", [["weekend", "A weekend"], ["week", "About a week"], ["long", "Longer"]]],
    ["stay", "Where will you sleep?", [["site", "Campsites with hook-up"], ["mixed", "A mix"], ["offgrid", "Off-grid"]]],
    ["season", "Season", [["summer", "Summer"], ["shoulder", "Spring or autumn"], ["winter", "Winter"]]],
  ],
  defaults: { length: "weekend", stay: "site", season: "summer" },
  groups: ["Vehicle", "Living", "Before you go"],
  rules: [
    {
      items: [
        item("tyres", "Vehicle", "Tyre pressures and tread checked, spare included"),
        item("fluids", "Vehicle", "Oil, coolant and screen wash topped up"),
        item("gas", "Living", "Gas bottle full and the cooker tested"),
        item("water", "Living", "Fresh water tank filled"),
        item("bedding", "Living", "Bedding for the coldest night you expect"),
        item("firstaid", "Living", "First aid kit"),
        item("rules", "Before you go", "Overnight rules checked for each stop: many coastal car parks do not allow sleeping"),
        item("tide", "Before you go", "Never park on a beach or slipway that the tide can reach"),
      ],
    },
    { when: (s) => s.stay !== "site", items: [item("power", "Living", "Leisure battery charged, or a power bank"), item("toilet", "Living", "Toilet plan: a portable toilet or known facilities"), item("waste", "Before you go", "Where you can empty grey water and waste, never on the beach or in drains")] },
    { when: (s) => s.stay === "site", items: [item("hookup", "Living", "Hook-up cable and adaptor"), item("booked", "Before you go", "Pitches booked, especially in school holidays")] },
    { when: (s) => s.length !== "weekend", items: [item("laundry", "Living", "Laundry plan and a washing line"), item("tools", "Vehicle", "Basic tools, jump leads and a tow rope"), item("cover", "Vehicle", "Breakdown cover that includes your van")] },
    { when: (s) => s.length === "long", items: [item("service", "Vehicle", "Van serviced before you go"), item("docs", "Before you go", "Insurance, licence and any travel documents in one folder")] },
    { when: (s) => s.season === "winter", items: [item("heater", "Living", "Heater fuel or gas for heating"), item("condensation", "Living", "Moisture traps and a window cracked open for air"), item("screen", "Vehicle", "Ice scraper and de-icer")] },
    { when: (s) => s.season === "summer", items: [item("shade", "Living", "Awning or shade, and fly screens"), item("cool", "Living", "Cool box or a fridge that runs off-grid")] },
    { when: (s) => s.season === "shoulder", items: [item("layers", "Living", "Layers for warm days and cold nights")] },
  ],
  note: (links) =>
    `${esc("Working out what the trip will cost?")} <a class="pkst-link" href="${esc(links.tool("coastal-overnight-budget-calculator"))}">${esc("Try the Coastal Overnight Budget Calculator")}</a>.`,
});
