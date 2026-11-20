import { boardShortlist, type SurfLevel, type WaveType } from "../web/lib/sea-lovers-tools";
import { choiceGroup, defaultLinks, esc, type WidgetLinks } from "./core";
import { atLeast, bindState, field, starterShell, toolLevel } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  // Level 1: compare the range with the board you ride now.
  const full = atLeast(toolLevel(root, "sea-lovers"), "level1");
  const state = { weight: 75, level: "improving" as SurfLevel, wave: "average" as WaveType, current: 0 };
  const form =
    field("number", "weight", "Your weight (kg)", state.weight, { hint: "With a wetsuit on, roughly.", attrs: { min: 30, max: 160, step: 1 } }) +
    choiceGroup("level", "How do you surf?", [["new", "New to it"], ["improving", "Improving"], ["experienced", "Experienced"]], state.level) +
    choiceGroup("wave", "Your usual waves", [["small", "Small and soft"], ["average", "Average"], ["powerful", "Powerful"]], state.wave) +
    (full ? field("number", "current", "Volume of the board you ride now (litres, optional)", state.current || "", { hint: "Printed on the deck or the box.", attrs: { min: 0, max: 200, step: 0.5 } }) : "");
  const { result, levels } = starterShell(root, links, {
    audience: "sea-lovers",
    audienceName: "Sea Lovers",
    type: "Calculator",
    intro: "Three answers give you a board volume range and the board types worth trying next.",
    form,
  });
  const render = () => {
    const r = boardShortlist(state.weight, state.level, state.wave);
    result.innerHTML = `<p class="pkst-eyebrow">VOLUME TO LOOK FOR</p>
      <div class="pkst-score"><strong>${r.litresFrom}–${r.litresTo}</strong><span>litres</span></div>
      ${full && Number(state.current) > 0 ? `<p>${esc(currentNote(Number(state.current), r.litresFrom, r.litresTo))}</p>` : ""}
      <p class="pkst-eyebrow" style="margin-top:18px">BOARDS TO SHORTLIST</p>
      <ul class="pkst-list">${r.types.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <p class="pkst-note">A starting point, not a rule. More volume paddles and catches waves more easily, less turns more easily. Try a board before you buy it where you can, and ask your local surf shop.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  const lv = levels(state, render);
  return () => {
    unbind();
    lv.destroy();
  };
}

function currentNote(now: number, from: number, to: number) {
  if (now < from) return `Your board is ${Math.round((from - now) * 10) / 10} litres under this range. More volume would help you catch more waves.`;
  if (now > to) return `Your board is ${Math.round((now - to) * 10) / 10} litres over this range. A little less volume would turn more easily as you improve.`;
  return "Your board is inside this range. Change shape before you change volume.";
}
