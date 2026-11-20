import { seaSwimChecklist, type SwimConditions, type SwimGroup, type SwimType } from "../web/lib/starter-tools";
import { esc } from "./core";
import { item, kitChecker } from "./kit";

type S = { type: string; group: string; conditions: string };

// Level 1 adds the fuller list: the checks that matter once you swim often.
const level1 = (s: S) => [
  item("l1-entry-time", "Safety", "Know when the tide turns, and be out before it does", "level1"),
  item("l1-water-temp", "Safety", "Check the water temperature, not only the air", "level1"),
  item("l1-ear", "Kit", "Ear plugs if you get cold ears or swim often", "level1"),
  item("l1-shoes", "Kit", "Swim shoes for rocks, shingle or weever fish", "level1"),
  item("l1-warm-plan", "After your swim", "Change in order: top half first, hat on, then a warm drink", "level1"),
  ...(s.conditions === "cold" ? [item("l1-afterdrop", "After your swim", "Expect afterdrop: keep moving gently and don't take a hot shower straight away", "level1")] : []),
  ...(s.type !== "dip" ? [item("l1-visible", "Safety", "Bright tow float or hat a boat could see from a distance", "level1")] : []),
];

export const mount = kitChecker<S>({
  audience: "sea-lovers",
  audienceName: "Sea Lovers",
  intro: "Tell us about your next sea swim and get a kit and safety checklist to tick off before you go.",
  questions: [
    ["type", "What kind of swim?", [["dip", "Quick dip"], ["distance", "Longer swim"], ["remote", "Remote spot"]]],
    ["group", "Who is swimming?", [["alone", "Just me"], ["buddy", "Me and a buddy"], ["group", "A group"]]],
    ["conditions", "Expected conditions", [["calm", "Calm"], ["choppy", "Choppy"], ["cold", "Cold water"]]],
  ],
  defaults: { type: "dip", group: "buddy", conditions: "calm" },
  groups: ["Kit", "Safety", "After your swim"],
  build: (s) => [...seaSwimChecklist(s.type as SwimType, s.group as SwimGroup, s.conditions as SwimConditions), ...level1(s)],
  note: () => esc("This list covers the basics. Local advice from lifeguards and swim groups comes first, and if in doubt, stay out."),
});
