import { esc } from "./core";
import { item, kitChecker } from "./kit";

type S = { site: string; exposure: string; stage: string };

export const mount = kitChecker<S>({
  audience: "coastal-experts",
  audienceName: "Coastal Experts",
  type: "Generator",
  intro: "Build a site visit checklist for a coastal project, so you come back with every detail you need. Print it with your browser's print option, or tick it off on your phone.",
  questions: [
    ["site", "Type of site", [["building", "Building"], ["marine", "Quay, pontoon or slipway"], ["land", "Open land or dunes"]]],
    ["exposure", "Exposure", [["sheltered", "Sheltered"], ["exposed", "Exposed coast"], ["tidal", "Tidal or intertidal"]]],
    ["stage", "Project stage", [["survey", "Survey"], ["design", "Design"], ["build", "Build or handover"]]],
  ],
  defaults: { site: "building", exposure: "exposed", stage: "survey" },
  groups: ["Before you go", "On site", "Record", "Afterwards"],
  rules: [
    {
      items: [
        item("tide", "Before you go", "Tide times and the safe working window checked"),
        item("access", "Before you go", "Access agreed with the owner, and the contact's number"),
        item("ppe", "Before you go", "PPE packed: boots, hi-vis, hard hat, gloves"),
        item("tell", "Before you go", "Someone knows where you are and when you will be back"),
        item("photos", "Record", "Photos of every elevation or edge, with a scale and the date"),
        item("weather", "Record", "Wind direction, weather and state of tide at the time of the visit"),
        item("notes", "Afterwards", "Notes written up the same day while it is fresh"),
      ],
    },
    { when: (s) => s.site === "building", items: [item("salt", "On site", "Salt damage: spalling, rust staining, failed fixings"), item("damp", "On site", "Damp readings on the seaward walls"), item("roof", "On site", "Roof, gutters and flashings facing the prevailing wind")] },
    { when: (s) => s.site === "marine", items: [item("piles", "On site", "Piles, fenders and fixings at low water"), item("deck", "On site", "Deck boards, cleats and ladders"), item("scour", "On site", "Scour around foundations"), item("ringbuoy", "Before you go", "Throw line or ring buoy within reach when working at the edge")] },
    { when: (s) => s.site === "land", items: [item("erosion", "On site", "Erosion line marked against a fixed point"), item("drainage", "On site", "Drainage paths and standing water"), item("habitat", "On site", "Protected habitats or nesting areas noted")] },
    { when: (s) => s.exposure === "exposed", items: [item("wind", "On site", "Wind loading on structures and anything that can work loose"), item("spray", "Record", "Spray zone: how far inland salt reaches")] },
    { when: (s) => s.exposure === "tidal", items: [item("hwm", "Record", "High water mark and surge debris line"), item("cutoff", "Before you go", "Cut-off points: where the tide can trap you")] },
    { when: (s) => s.stage === "survey", items: [item("measure", "Record", "Key dimensions and levels"), item("services", "On site", "Services and utilities located")] },
    { when: (s) => s.stage === "design", items: [item("constraints", "Record", "Constraints for the design: setbacks, flood levels, consents"), item("client", "On site", "Walk the site with the client and note their priorities")] },
    { when: (s) => s.stage === "build", items: [item("snag", "On site", "Snagging list against the specification"), item("signoff", "Afterwards", "Handover sign-off and maintenance notes sent to the client")] },
  ],
  note: () => esc("Never work alone at the water's edge or below the high water mark, and stop if conditions change."),
});
