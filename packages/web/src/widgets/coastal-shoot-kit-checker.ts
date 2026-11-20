import { esc } from "./core";
import { item, kitChecker } from "./kit";

type S = { subject: string; light: string; conditions: string };

export const mount = kitChecker<S>({
  audience: "sea-lovers",
  audienceName: "Sea Lovers",
  intro: "Tell us what you plan to shoot on the coast and get a kit list that suits the light and the weather.",
  questions: [
    ["subject", "What are you shooting?", [["landscape", "Coastal landscape"], ["people", "People or portraits"], ["action", "Surf, boats or wildlife"]]],
    ["light", "When?", [["golden", "Golden hour"], ["day", "Daytime"], ["night", "Night or blue hour"]]],
    ["conditions", "Expected conditions", [["dry", "Dry and calm"], ["spray", "Spray or drizzle"], ["wind", "Strong wind"]]],
  ],
  defaults: { subject: "landscape", light: "golden", conditions: "dry" },
  groups: ["Camera", "Protection", "Before you go"],
  rules: [
    {
      items: [
        item("batteries", "Camera", "Charged batteries, plus a spare"),
        item("cards", "Camera", "Empty memory cards"),
        item("cloth", "Protection", "Microfibre cloths for salt spray on the lens"),
        item("tide", "Before you go", "Tide times checked, and your way off the beach at high tide"),
        item("tell", "Before you go", "Someone knows where you are shooting and when you will be back"),
      ],
    },
    { when: (s) => s.subject === "landscape", items: [item("wide", "Camera", "Wide-angle lens"), item("tripod", "Camera", "Tripod"), item("nd", "Camera", "ND and graduated filters for long exposures of the water")] },
    { when: (s) => s.subject === "people", items: [item("portrait", "Camera", "Portrait lens, around 50 to 85 mm"), item("reflector", "Camera", "Reflector to lift shadows"), item("consent", "Before you go", "Agree with the people in your photos how the pictures will be used")] },
    { when: (s) => s.subject === "action", items: [item("tele", "Camera", "Telephoto lens"), item("burst", "Camera", "Fast cards for burst shooting"), item("distance", "Before you go", "Keep your distance from wildlife and from surfers' paths")] },
    { when: (s) => s.light !== "day", items: [item("torch", "Protection", "Head torch with a red light mode"), item("remote", "Camera", "Remote shutter release or the self-timer set up")] },
    { when: (s) => s.light === "night", items: [item("warm", "Protection", "Warm layers: it gets cold fast after dark on the coast"), item("route", "Before you go", "Walk the route in daylight first")] },
    { when: (s) => s.light === "day", items: [item("polariser", "Camera", "Polarising filter to cut glare off the water"), item("sun", "Protection", "Sun cream and a hat")] },
    { when: (s) => s.conditions === "spray", items: [item("cover", "Protection", "Rain cover for the camera"), item("bag", "Protection", "Waterproof bag, and dry the camera before you open it")] },
    { when: (s) => s.conditions === "wind", items: [item("weight", "Camera", "Hook a bag under the tripod to steady it"), item("sand", "Protection", "Change lenses inside the bag, out of blowing sand")] },
  ],
  note: () => esc("Rinse salt off your kit with a damp cloth when you get home. Never turn your back on the sea when you shoot near the water."),
});
