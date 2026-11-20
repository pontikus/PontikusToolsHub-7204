import { boardShortlist, type SurfLevel, type WaveType } from "../web/lib/sea-lovers-tools";
import { choiceGroup, defaultLinks, esc, type WidgetLinks } from "./core";
import { bindState, field, starterShell } from "./kit";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  const state = { weight: 75, level: "improving" as SurfLevel, wave: "average" as WaveType };
  const form =
    field("number", "weight", "Your weight (kg)", state.weight, { hint: "With a wetsuit on, roughly.", attrs: { min: 30, max: 160, step: 1 } }) +
    choiceGroup("level", "How do you surf?", [["new", "New to it"], ["improving", "Improving"], ["experienced", "Experienced"]], state.level) +
    choiceGroup("wave", "Your usual waves", [["small", "Small and soft"], ["average", "Average"], ["powerful", "Powerful"]], state.wave);
  const { result } = starterShell(root, links, {
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
      <p class="pkst-eyebrow" style="margin-top:18px">BOARDS TO SHORTLIST</p>
      <ul class="pkst-list">${r.types.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      <p class="pkst-note">A starting point, not a rule. More volume paddles and catches waves more easily, less turns more easily. Try a board before you buy it where you can, and ask your local surf shop.</p>`;
  };
  const unbind = bindState(root, state, render);
  render();
  return unbind;
}
