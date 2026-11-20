import { esc } from "./core";
import { item, kitChecker } from "./kit";

type S = { craft: string; trip: string; water: string };

export const mount = kitChecker<S>({
  audience: "sea-lovers",
  audienceName: "Sea Lovers",
  intro: "Tell us about your next paddle and get a kit and safety checklist to tick off before you launch.",
  questions: [
    ["craft", "What are you paddling?", [["sup", "Stand-up paddleboard"], ["kayak", "Sit-on-top kayak"], ["sea-kayak", "Sea kayak"]]],
    ["trip", "What kind of trip?", [["near", "Close to shore"], ["along", "Along the coast"], ["open", "Crossing or open water"]]],
    ["water", "Water temperature", [["warm", "Warm"], ["mild", "Mild"], ["cold", "Cold"]]],
  ],
  defaults: { craft: "sup", trip: "near", water: "mild" },
  groups: ["Kit", "Safety", "Before you launch"],
  rules: [
    {
      items: [
        item("pfd", "Kit", "Buoyancy aid that fits, done up"),
        item("paddle", "Kit", "Paddle, checked for cracks and loose joints"),
        item("water", "Kit", "Drinking water and a snack"),
        item("phone", "Safety", "Phone in a waterproof pouch, worn on you, not on the board"),
        item("forecast", "Before you launch", "Wind forecast checked: offshore wind is the one to avoid"),
        item("tide", "Before you launch", "Tide times checked, and what the tide does at your launch spot"),
        item("tell", "Before you launch", "Someone on shore knows your route and when you will be back"),
      ],
    },
    { when: (s) => s.craft === "sup", items: [item("leash", "Kit", "Leash: coiled for flat water, quick-release waist leash in moving water"), item("fin", "Kit", "Fin fitted and tight")] },
    { when: (s) => s.craft !== "sup", items: [item("drybag", "Kit", "Dry bag for spare layer and keys"), item("bailer", "Kit", "Pump or sponge")] },
    { when: (s) => s.craft === "sea-kayak", items: [item("spray", "Kit", "Spraydeck that you can release"), item("rescue", "Safety", "Practised self-rescue and a paddle float")] },
    { when: (s) => s.trip !== "near", items: [item("whistle", "Safety", "Whistle on your buoyancy aid"), item("tow", "Safety", "Towline if you paddle in a group"), item("plan-b", "Before you launch", "A second landing spot in case you need to get off early")] },
    { when: (s) => s.trip === "open", items: [item("vhf", "Safety", "Handheld VHF radio or personal locator beacon"), item("flare", "Safety", "Flares or a strobe light"), item("group", "Before you launch", "Paddle with others, and agree who leads and who sweeps")] },
    { when: (s) => s.water === "cold", items: [item("wetsuit", "Kit", "Wetsuit or drysuit, dressed for a swim, not for the air"), item("hat", "Kit", "Neoprene hat, gloves or pogies"), item("warm", "Before you launch", "Warm clothes and a hot drink waiting on shore")] },
    { when: (s) => s.water === "warm", items: [item("sun", "Kit", "Sun cream, hat and a rash vest"), item("shade", "Before you launch", "Plan the paddle away from the hottest part of the day")] },
    { when: (s) => s.water === "mild", items: [item("layer", "Kit", "A spare warm layer in a dry bag")] },
  ],
  note: () => esc("This list covers the basics. Paddle within your experience, check local rules and harbour advice, and if in doubt, don't go out."),
});
