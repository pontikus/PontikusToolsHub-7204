import { seaSwimChecklist, type SwimConditions, type SwimGroup, type SwimType } from "../web/lib/starter-tools";
import { choiceGroup, defaultLinks, esc, injectStyles, ladder, shell, verifyCta, type WidgetLinks } from "./core";

export function mount(root: HTMLElement, links: WidgetLinks = defaultLinks) {
  injectStyles(root.ownerDocument);
  const state = { type: "dip" as SwimType, group: "buddy" as SwimGroup, conditions: "calm" as SwimConditions };
  const ticked = new Set<string>();
  const form = () =>
    choiceGroup("type", "What kind of swim?", [["dip", "Quick dip"], ["distance", "Longer swim"], ["remote", "Remote spot"]], state.type) +
    choiceGroup("group", "Who is swimming?", [["alone", "Just me"], ["buddy", "Me and a buddy"], ["group", "A group"]], state.group) +
    choiceGroup("conditions", "Expected conditions", [["calm", "Calm"], ["choppy", "Choppy"], ["cold", "Cold water"]], state.conditions);
  root.innerHTML = shell({
    audienceName: "Sea Lovers",
    typeLabel: "Checker",
    intro: "Tell us about your next sea swim and get a kit and safety checklist to tick off before you go.",
    form: "",
    result: "",
  });
  const formEl = root.querySelector<HTMLElement>(".pkst-form")!;
  const result = root.querySelector<HTMLElement>(".pkst-result")!;
  root.querySelector<HTMLElement>(".pkst-after")!.innerHTML = ladder("sea-lovers", "Checker") + `<div>${verifyCta(links)}</div>`;

  const render = () => {
    formEl.innerHTML = form();
    const items = seaSwimChecklist(state.type, state.group, state.conditions);
    const done = items.filter((i) => ticked.has(i.id)).length;
    const groups = (["Kit", "Safety", "After your swim"] as const)
      .map((g) => {
        const rows = items
          .filter((i) => i.group === g)
          .map(
            (i) =>
              `<li><label><input type="checkbox" data-tick="${esc(i.id)}"${ticked.has(i.id) ? " checked" : ""}><span>${esc(i.text)}</span></label></li>`,
          )
          .join("");
        return rows ? `<li><h4>${g}</h4><ul class="pkst-check">${rows}</ul></li>` : "";
      })
      .join("");
    result.innerHTML = `
      <p class="pkst-eyebrow">YOUR CHECKLIST</p>
      <p class="pkst-progress">${done} of ${items.length} ticked${done === items.length ? " · all set" : ""}</p>
      <ul class="pkst-check">${groups}</ul>
      <p class="pkst-note">This list covers the basics. Local advice from lifeguards and swim groups comes first, and if in doubt, stay out.</p>`;
  };
  const onClick = (e: Event) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>("button[data-k]");
    if (!btn) return;
    const key = btn.dataset.k as keyof typeof state;
    (state as Record<string, string>)[key] = btn.dataset.v!;
    render();
    root.querySelector<HTMLButtonElement>(`button[data-k="${key}"][data-v="${btn.dataset.v}"]`)?.focus();
  };
  const onChange = (e: Event) => {
    const box = e.target as HTMLInputElement;
    const id = box.dataset.tick;
    if (!id) return;
    if (box.checked) ticked.add(id);
    else ticked.delete(id);
    const items = seaSwimChecklist(state.type, state.group, state.conditions);
    const done = items.filter((i) => ticked.has(i.id)).length;
    const p = result.querySelector(".pkst-progress");
    if (p) p.textContent = `${done} of ${items.length} ticked${done === items.length ? " · all set" : ""}`;
  };
  root.addEventListener("click", onClick);
  root.addEventListener("change", onChange);
  render();
  return () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("change", onChange);
  };
}
